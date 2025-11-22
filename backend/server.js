const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const simpleGit = require('simple-git');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
require('dotenv').config();

// Import middleware
const { authenticate } = require('./middleware/auth');
const { rateLimiters } = require('./middleware/rateLimiter');
const { helmet } = require('./middleware/security');
const { validateRecipeGeneration, validateCommit, validateRecipePath } = require('./middleware/validation');
const { asyncHandler, errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const REPO_PATH = process.env.REPO_PATH || path.join(__dirname, '..');
const RECIPES_PATH = path.join(REPO_PATH, 'recipes');
const FRONTEND_PATH = path.join(REPO_PATH, 'frontend');
const JOBS_PATH = path.join(REPO_PATH, 'backend', '.jobs');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'origin';
const CLAUDE_PATH = process.env.CLAUDE_PATH || '/home/pablo/.nvm/versions/node/v20.19.5/bin/claude';

// Initialize git
const git = simpleGit(REPO_PATH);

// Create jobs directories
const initJobsDirectories = async () => {
  await fs.mkdir(path.join(JOBS_PATH, 'pending'), { recursive: true });
  await fs.mkdir(path.join(JOBS_PATH, 'completed'), { recursive: true });
  await fs.mkdir(path.join(JOBS_PATH, 'failed'), { recursive: true });
  await fs.mkdir(path.join(JOBS_PATH, 'committed'), { recursive: true });
};

initJobsDirectories().catch(console.error);

// Running jobs map (jobId → child process)
const runningJobs = new Map();

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Security headers (must be before CORS)
app.use(helmet);

// CORS for React frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rate limiting for public endpoints
app.use('/api/recipes/manifest', rateLimiters.public);
app.use('/api/recipes/file', rateLimiters.public);

// API routes only - no static file serving

// Helper: Read job from disk
const readJob = async (jobId) => {
  const folders = ['pending', 'completed', 'failed', 'committed'];
  for (const folder of folders) {
    try {
      const jobPath = path.join(JOBS_PATH, folder, `${jobId}.json`);
      const data = await fs.readFile(jobPath, 'utf8');
      return { ...JSON.parse(data), folder };
    } catch (error) {
      // Continue to next folder
    }
  }
  return null;
};

// Helper: Write job to disk
const writeJob = async (jobId, data, folder = 'pending') => {
  const jobPath = path.join(JOBS_PATH, folder, `${jobId}.json`);
  await fs.writeFile(jobPath, JSON.stringify(data, null, 2), 'utf8');
};

// Helper: Move job between folders
const moveJob = async (jobId, fromFolder, toFolder) => {
  const fromPath = path.join(JOBS_PATH, fromFolder, `${jobId}.json`);
  const toPath = path.join(JOBS_PATH, toFolder, `${jobId}.json`);
  
  const data = await fs.readFile(fromPath, 'utf8');
  await fs.writeFile(toPath, data, 'utf8');
  await fs.unlink(fromPath);
};

// Helper: Delete job
const deleteJob = async (jobId) => {
  const folders = ['pending', 'completed', 'failed', 'committed'];
  for (const folder of folders) {
    try {
      const jobPath = path.join(JOBS_PATH, folder, `${jobId}.json`);
      await fs.unlink(jobPath);
      return true;
    } catch (error) {
      // Continue
    }
  }
  return false;
};

// Background job processor
const processJob = async (jobId, jobData) => {
  try {
    const { prompt, mode = 'create' } = jobData;
    
    let researchContext = '';
    let response = ''; // Will hold the Claude CLI response
    
    // Mode: "create" - do research first, then generate
    if (mode === 'create') {
      // Generate research query from the prompt
      const researchQuery = prompt;
      
      // Update status: Researching
      jobData.status = 'researching';
      jobData.progress = 'Researching with Gemini...';
      await writeJob(jobId, jobData, 'pending');

      // Do research
      try {
        const escapedQuery = researchQuery.replace(/'/g, "'\\''");
        const researchPrompt = `Research the following recipe topic and provide detailed information that will help create the best recipe:\n\n${escapedQuery}\n\nProvide specific details about:\n- Traditional ingredients and techniques\n- Cultural context and variations\n- Cooking methods and tips\n- Ingredient substitutions and alternatives\n- Serving suggestions and pairings`;
        const escapedResearchPrompt = researchPrompt.replace(/'/g, "'\\''");
        
        // Prepare environment for Claude Code CLI
        const claudeEnv = {
          ...process.env,
          HOME: process.env.HOME || '/home/pablo',
          USER: process.env.USER || 'pablo',
          PATH: process.env.PATH || '/home/pablo/.nvm/versions/node/v20.19.5/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
        };
        delete claudeEnv.ANTHROPIC_API_KEY;
        
        const { stdout, stderr } = await execPromise(`unbuffer ${CLAUDE_PATH} --dangerously-skip-permissions -p '@gemini-research-expert ${escapedResearchPrompt}'`, {
          timeout: 600000,
          cwd: REPO_PATH,
          env: claudeEnv
        });
        if (stderr) console.error('Research stderr:', stderr);
        researchContext = stdout.trim();
        console.log(`[Job ${jobId}] Research completed`);
        
        jobData.researchContext = researchContext;
        await writeJob(jobId, jobData, 'pending');
      } catch (error) {
        console.error(`[Job ${jobId}] Research failed:`, error.message);
        researchContext = '';
      }

      // Update status: Generating
      jobData.status = 'generating';
      jobData.progress = 'Generating recipe with Claude CLI...';
      await writeJob(jobId, jobData, 'pending');

      // Build recipe prompt with research context
      const fullPrompt = researchContext 
        ? `Based on this research:\n\n${researchContext}\n\n---\n\nNow, ${prompt}`
        : prompt;

      const recipePrompt = `${fullPrompt}\n\nIMPORTANT: Generate TWO versions of the recipe in markdown format.

For each version:
- Use proper markdown format
- Include: title, description, yields, prep/cook time
- Organize: Ingredients section with proper grouping
- Organize: Instructions section with clear steps
- Use the same structure as existing recipes in the collection
- Keep the recipe name consistent between versions (translated)

You MUST provide your response EXACTLY in this format (output the content, do not try to save files):

===ENGLISH===
[full English recipe markdown content here]
===SPANISH===
[full Spanish recipe markdown content here]
===FILENAMES===
English: [suggested_filename].md
Spanish: [suggested_filename].md

Do not add any other text before or after this format. Just output the recipes in this exact structure.`;

      // Generate recipe
      const escapedRecipePrompt = recipePrompt.replace(/'/g, "'\\''");
      
      // Prepare environment for Claude Code CLI
      const claudeEnv = {
        ...process.env,
        HOME: process.env.HOME || '/home/pablo',
        USER: process.env.USER || 'pablo',
        PATH: process.env.PATH || '/home/pablo/.nvm/versions/node/v20.19.5/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
      };
      delete claudeEnv.ANTHROPIC_API_KEY;
      
      const { stdout, stderr } = await execPromise(`unbuffer ${CLAUDE_PATH} --dangerously-skip-permissions -p '${escapedRecipePrompt}'`, {
        timeout: 600000,
        cwd: REPO_PATH,
        env: claudeEnv
      });
      if (stderr) console.error('Claude stderr:', stderr);
      response = stdout.trim();
      console.log(`[Job ${jobId}] Recipe generated`);
      
    } else {
      // Mode: "store" - format/organize existing recipe (no research)
      jobData.status = 'formatting';
      jobData.progress = 'Formatting recipe with Claude CLI...';
      await writeJob(jobId, jobData, 'pending');

      // Format the recipe prompt
      const formatPrompt = `I have a recipe that I want to organize and format. Please take the following recipe content and format it properly according to my recipe collection structure:\n\n${prompt}\n\nIMPORTANT: Generate TWO versions of the recipe in markdown format (English and Spanish).

For each version:
- Use proper markdown format
- Include: title, description, yields, prep/cook time
- Organize: Ingredients section with proper grouping
- Organize: Instructions section with clear steps
- Use the same structure as existing recipes in the collection
- Keep the recipe name consistent between versions (translated)
- Extract and organize all information from the provided recipe

You MUST provide your response EXACTLY in this format (output the content, do not try to save files):

===ENGLISH===
[full English recipe markdown content here]
===SPANISH===
[full Spanish recipe markdown content here]
===FILENAMES===
English: [suggested_filename].md
Spanish: [suggested_filename].md

Do not add any other text before or after this format. Just output the recipes in this exact structure.`;

      const escapedFormatPrompt = formatPrompt.replace(/'/g, "'\\''");
      
      // Prepare environment for Claude Code CLI
      const claudeEnv = {
        ...process.env,
        HOME: process.env.HOME || '/home/pablo',
        USER: process.env.USER || 'pablo',
        PATH: process.env.PATH || '/home/pablo/.nvm/versions/node/v20.19.5/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
      };
      delete claudeEnv.ANTHROPIC_API_KEY;
      
      const { stdout, stderr } = await execPromise(`unbuffer ${CLAUDE_PATH} --dangerously-skip-permissions -p '${escapedFormatPrompt}'`, {
        timeout: 600000,
        cwd: REPO_PATH,
        env: claudeEnv
      });
      if (stderr) console.error('Claude stderr:', stderr);
      response = stdout.trim();
      console.log(`[Job ${jobId}] Recipe formatted`);
    }
    
    // Parse response (same for both modes)
    const englishMatch = response.match(/===ENGLISH===\n([\s\S]*?)===SPANISH===/);
    const spanishMatch = response.match(/===SPANISH===\n([\s\S]*?)===FILENAMES===/);
    const filenamesMatch = response.match(/===FILENAMES===\n([\s\S]*?)$/);

    if (!englishMatch || !spanishMatch) {
      throw new Error('Failed to parse recipe format from AI response');
    }

    const englishRecipe = englishMatch[1].trim();
    const spanishRecipe = spanishMatch[1].trim();
    
    let englishFilename = 'new_recipe.md';
    let spanishFilename = 'nueva_receta.md';
    
    if (filenamesMatch) {
      const filenames = filenamesMatch[1];
      const engMatch = filenames.match(/English:\s*(.+\.md)/);
      const spaMatch = filenames.match(/Spanish:\s*(.+\.md)/);
      if (engMatch) englishFilename = engMatch[1].trim();
      if (spaMatch) spanishFilename = spaMatch[1].trim();
    }

    // Job complete - move to completed
    const completedData = {
      ...jobData,
      status: 'completed',
      progress: mode === 'create' ? 'Recipe generated successfully' : 'Recipe formatted successfully',
      completedAt: new Date().toISOString(),
      recipes: {
        english: {
          content: englishRecipe,
          filename: englishFilename,
          path: `recipes/english/recipes/${englishFilename}`
        },
        spanish: {
          content: spanishRecipe,
          filename: spanishFilename,
          path: `recipes/spanish/recipes/${spanishFilename}`
        }
      }
    };

    await writeJob(jobId, completedData, 'completed');
    await deleteJob(jobId); // Remove from pending
    runningJobs.delete(jobId);
    
    console.log(`[Job ${jobId}] Completed successfully`);

  } catch (error) {
    console.error(`[Job ${jobId}] Failed:`, error);
    
    // Check if it's a timeout error
    const isTimeout = error.killed || error.signal === 'SIGTERM' || 
                      (error.message && error.message.includes('timeout'));
    
    // Move to failed with full error details
    const failedData = {
      ...jobData,
      status: 'failed',
      error: isTimeout ? `Timeout: Claude took longer than 10 minutes. ${error.message}` : error.message,
      errorStack: error.stack,
      errorStderr: error.stderr || null,
      errorStdout: error.stdout || null,
      errorCode: error.code || null,
      errorSignal: error.signal || null,
      errorKilled: error.killed || false,
      isTimeout: isTimeout,
      failedAt: new Date().toISOString()
    };
    
    await writeJob(jobId, failedData, 'failed');
    await deleteJob(jobId); // Remove from pending
    runningJobs.delete(jobId);
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get recipe manifest/structure
app.get('/api/recipes/manifest', asyncHandler(async (req, res) => {
  // Generate recipe structure manifest dynamically
  const scanDirectory = (dirPath, basePath = '') => {
    const items = [];
    try {
      const entries = fsSync.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip hidden files and system folders
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }
        
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name);
        
        if (entry.isDirectory()) {
          const children = scanDirectory(fullPath, relativePath);
          items.push({
            name: entry.name,
            type: 'folder',
            path: relativePath,
            children: children
          });
        } else if (entry.name.endsWith('.md')) {
          items.push({
            name: entry.name.replace('.md', ''),
            type: 'file',
            path: relativePath
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
    
    return items.sort((a, b) => {
      // Folders first, then alphabetically
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  };
  
  const structure = scanDirectory(RECIPES_PATH, 'recipes');
  const manifest = {
    generated: new Date().toISOString(),
    structure: structure
  };
  
  res.json(manifest);
}));

// Get individual recipe file
app.get('/api/recipes/file/:path(*)', validateRecipePath, asyncHandler(async (req, res) => {
  // Ensure path starts with 'recipes/' prefix
  let recipePath = req.params.path;
  if (!recipePath.startsWith('recipes/')) {
    recipePath = 'recipes/' + recipePath;
  }
  
  const fullPath = path.join(REPO_PATH, recipePath);
  
  // Security: ensure path is within recipes directory
  const normalizedPath = path.normalize(fullPath);
  const recipesDir = path.normalize(RECIPES_PATH);
  
  if (!normalizedPath.startsWith(recipesDir)) {
    const err = new Error('Invalid path');
    err.statusCode = 403;
    throw err;
  }
  
  const content = await fs.readFile(fullPath, 'utf8');
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.send(content);
}));

// Admin routes - require authentication and rate limiting
app.use('/api/generate-recipe', authenticate, rateLimiters.recipeGeneration);
app.use('/api/job', authenticate, rateLimiters.admin);
app.use('/api/jobs', authenticate, rateLimiters.admin);
app.use('/api/git', authenticate, rateLimiters.admin);
app.use('/api/save-recipe', authenticate, rateLimiters.admin);

// Start recipe generation (returns jobId immediately)
app.post('/api/generate-recipe', validateRecipeGeneration, asyncHandler(async (req, res) => {
  const { prompt, mode = 'create' } = req.body;

  // Create job
  const jobId = Date.now().toString();
  const jobData = {
    jobId,
    prompt,
    mode: mode === 'store' ? 'store' : 'create',
    status: 'pending',
    progress: 'Starting...',
    createdAt: new Date().toISOString()
  };

  await writeJob(jobId, jobData, 'pending');

  // Start processing in background (don't await)
  processJob(jobId, jobData).catch(err => {
    console.error(`Background job ${jobId} error:`, err);
  });

  // Return immediately
  res.json({ 
    success: true,
    jobId 
  });
}));

// Get job status
app.get('/api/job/:jobId', asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = await readJob(jobId);
  
  if (!job) {
    const err = new Error('Job not found');
    err.statusCode = 404;
    throw err;
  }

  res.json(job);
}));

// List all jobs
app.get('/api/jobs', asyncHandler(async (req, res) => {
  const readJobsFromFolder = async (folder) => {
    try {
      const files = await fs.readdir(path.join(JOBS_PATH, folder));
      const jobs = await Promise.all(
        files
          .filter(f => f.endsWith('.json'))
          .map(async (file) => {
            const data = await fs.readFile(path.join(JOBS_PATH, folder, file), 'utf8');
            return JSON.parse(data);
          })
      );
      return jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      return [];
    }
  };

  const [pending, completed, failed] = await Promise.all([
    readJobsFromFolder('pending'),
    readJobsFromFolder('completed'),
    readJobsFromFolder('failed')
  ]);

  res.json({
    pending,
    drafts: completed, // completed = drafts (not yet committed)
    failed
  });
}));

// Commit a draft (save to recipes folder and commit to git)
app.post('/api/job/:jobId/commit', validateCommit, asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { commitMessage } = req.body;
    
  console.log(`[Commit] Starting commit for job ${jobId}`);
  
  const job = await readJob(jobId);
  
  if (!job) {
    const err = new Error('Job not found');
    err.statusCode = 404;
    throw err;
  }
  
  if (job.folder !== 'completed') {
    const err = new Error(`Job is not completed. Current status: ${job.folder}`);
    err.statusCode = 400;
    throw err;
  }

  if (!job.recipes || !job.recipes.english || !job.recipes.spanish) {
    const err = new Error('Job missing recipe data');
    err.statusCode = 400;
    throw err;
  }

  const { recipes } = job;
  console.log(`[Commit] Recipes found: ${recipes.english.filename}, ${recipes.spanish.filename}`);

  // Save English recipe
  const englishPath = path.join(REPO_PATH, recipes.english.path);
  await fs.mkdir(path.dirname(englishPath), { recursive: true });
  await fs.writeFile(englishPath, recipes.english.content, 'utf8');

  // Save Spanish recipe
  const spanishPath = path.join(REPO_PATH, recipes.spanish.path);
  await fs.mkdir(path.dirname(spanishPath), { recursive: true });
  await fs.writeFile(spanishPath, recipes.spanish.content, 'utf8');

  // Regenerate manifest (non-blocking - continue if it fails)
  try {
    await new Promise((resolve, reject) => {
      exec('node generate_manifest.js', { cwd: FRONTEND_PATH }, (error, stdout, stderr) => {
        if (error) {
          console.error('Manifest generation error:', error);
          console.error('Manifest stderr:', stderr);
          reject(error);
        } else {
          console.log('Manifest generated successfully');
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Failed to regenerate manifest:', error);
    // Continue anyway - recipes are saved
  }

  // Git operations
  await git.add([
    recipes.english.path,
    recipes.spanish.path,
    'frontend/index.html',
    'frontend/service-worker.js'
  ]);

  const message = commitMessage || `Add recipe: ${recipes.english.filename}`;
  await git.commit(message);
  console.log(`Committed: ${message}`);

  // Push to GitHub (non-blocking - return success even if push fails)
  try {
    console.log(`[Commit] Attempting to push to ${GITHUB_REPO}/main`);
    
    // Configure git remote URL with token if available
    if (GITHUB_TOKEN) {
      const remoteUrl = `https://${GITHUB_TOKEN}@github.com/PabloCortes33/recipes.git`;
      await git.remote(['set-url', 'origin', remoteUrl]);
      console.log('[Commit] Configured git remote with token');
    }
    
    await git.push(GITHUB_REPO, 'main');
    console.log('[Commit] Pushed to GitHub successfully');
  } catch (pushError) {
    console.error('[Commit] Git push failed:', pushError);
    console.error('[Commit] Push error details:', pushError.message);
    // Don't fail the whole operation if push fails - recipe is still committed
    await moveJob(jobId, 'completed', 'committed');
    return res.json({
      success: true,
      message: 'Recipe committed locally. Push to GitHub failed - you can push manually.',
      warning: pushError.message
    });
  }

  // Move job to committed
  await moveJob(jobId, 'completed', 'committed');

  res.json({
    success: true,
    message: 'Recipe committed and pushed to GitHub'
  });
}));

// Refine a completed recipe (brainstorm/iterate)
app.post('/api/job/:jobId/refine', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { refinementPrompt } = req.body;
    
    if (!refinementPrompt || !refinementPrompt.trim()) {
      return res.status(400).json({ error: 'Refinement prompt is required' });
    }
    
    console.log(`[Refine] Starting refinement for job ${jobId}`);
    
    const job = await readJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.folder !== 'completed') {
      return res.status(400).json({ error: 'Can only refine completed recipes' });
    }
    
    if (!job.recipes || !job.recipes.english || !job.recipes.spanish) {
      return res.status(400).json({ error: 'Job missing recipe data' });
    }
    
    // Create a new job for the refinement
    const refineJobId = Date.now().toString();
    const refineJobData = {
      jobId: refineJobId,
      prompt: refinementPrompt,
      mode: 'refine',
      originalJobId: jobId,
      originalRecipes: job.recipes,
      status: 'pending',
      progress: 'Starting refinement...',
      createdAt: new Date().toISOString()
    };
    
    await writeJob(refineJobId, refineJobData, 'pending');
    
    // Start processing refinement in background
    processRefinement(refineJobId, refineJobData).catch(err => {
      console.error(`Background refinement job ${refineJobId} error:`, err);
    });
    
    res.json({
      success: true,
      jobId: refineJobId,
      originalJobId: jobId,
      message: 'Refinement started'
    });
    
  } catch (error) {
    console.error('Error starting refinement:', error);
    res.status(500).json({
      error: 'Failed to start refinement',
      details: error.message
    });
  }
});

// Process refinement job
const processRefinement = async (jobId, jobData) => {
  try {
    const { refinementPrompt, originalRecipes } = jobData;
    
    // Update status: Refining
    jobData.status = 'refining';
    jobData.progress = 'Refining recipe with Claude CLI...';
    await writeJob(jobId, jobData, 'pending');
    
    // Build refinement prompt
    const refinePrompt = `I have an existing recipe that I want to refine. Here is the current recipe:

===CURRENT ENGLISH RECIPE===
${originalRecipes.english.content}

===CURRENT SPANISH RECIPE===
${originalRecipes.spanish.content}

===REFINEMENT REQUEST===
${refinementPrompt}

IMPORTANT: Generate TWO refined versions of the recipe in markdown format (English and Spanish).

For each version:
- Use proper markdown format
- Include: title, description, yields, prep/cook time
- Organize: Ingredients section with proper grouping
- Organize: Instructions section with clear steps
- Use the same structure as existing recipes in the collection
- Keep the recipe name consistent between versions (translated)
- Apply the refinement request while maintaining the recipe's core identity

You MUST provide your response EXACTLY in this format (output the content, do not try to save files):

===ENGLISH===
[full English recipe markdown content here]
===SPANISH===
[full Spanish recipe markdown content here]
===FILENAMES===
English: [suggested_filename].md
Spanish: [suggested_filename].md

Do not add any other text before or after this format. Just output the refined recipes in this exact structure.`;

    const escapedRefinePrompt = refinePrompt.replace(/'/g, "'\\''");
    
    // Prepare environment for Claude Code CLI
    const claudeEnv = {
      ...process.env,
      HOME: process.env.HOME || '/home/pablo',
      USER: process.env.USER || 'pablo',
      PATH: process.env.PATH || '/home/pablo/.nvm/versions/node/v20.19.5/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
    };
    delete claudeEnv.ANTHROPIC_API_KEY;
    
    const { stdout, stderr } = await execPromise(`unbuffer ${CLAUDE_PATH} --dangerously-skip-permissions -p '${escapedRefinePrompt}'`, {
      timeout: 600000,
      cwd: REPO_PATH,
      env: claudeEnv
    });
    
    if (stderr) console.error('Claude stderr:', stderr);
    const response = stdout.trim();
    console.log(`[Refine ${jobId}] Recipe refined`);
    
    // Parse response
    const englishMatch = response.match(/===ENGLISH===\n([\s\S]*?)===SPANISH===/);
    const spanishMatch = response.match(/===SPANISH===\n([\s\S]*?)===FILENAMES===/);
    const filenamesMatch = response.match(/===FILENAMES===\n([\s\S]*?)$/);
    
    if (!englishMatch || !spanishMatch) {
      throw new Error('Failed to parse refined recipe format from AI response');
    }
    
    const englishRecipe = englishMatch[1].trim();
    const spanishRecipe = spanishMatch[1].trim();
    
    let englishFilename = originalRecipes.english.filename;
    let spanishFilename = originalRecipes.spanish.filename;
    
    if (filenamesMatch) {
      const filenames = filenamesMatch[1];
      const engMatch = filenames.match(/English:\s*(.+\.md)/);
      const spaMatch = filenames.match(/Spanish:\s*(.+\.md)/);
      if (engMatch) englishFilename = engMatch[1].trim();
      if (spaMatch) spanishFilename = spaMatch[1].trim();
    }
    
    // Update the original job with refined recipes
    const originalJobId = jobData.originalJobId;
    const originalJob = originalJobId ? await readJob(originalJobId) : null;
    
    const refinedJobData = {
      ...(originalJob || jobData),
      status: 'completed',
      progress: 'Recipe refined successfully',
      completedAt: new Date().toISOString(),
      recipes: {
        english: {
          content: englishRecipe,
          filename: englishFilename,
          path: originalRecipes.english.path // Keep same path
        },
        spanish: {
          content: spanishRecipe,
          filename: spanishFilename,
          path: originalRecipes.spanish.path // Keep same path
        }
      },
      refinementHistory: [
        ...(originalJob?.refinementHistory || []),
        {
          prompt: refinementPrompt,
          refinedAt: new Date().toISOString()
        }
      ]
    };
    
    // Update the original job with refined recipes
    if (originalJobId) {
      await writeJob(originalJobId, refinedJobData, 'completed');
      await deleteJob(jobId); // Remove the refinement job
      console.log(`[Refine ${jobId}] Updated original job ${originalJobId} with refined recipe`);
    } else {
      // Fallback: save as new completed job
      await writeJob(jobId, refinedJobData, 'completed');
      await deleteJob(jobId); // Remove from pending
    }
    
    runningJobs.delete(jobId);
    console.log(`[Refine ${jobId}] Completed successfully`);
    
  } catch (error) {
    console.error(`[Refine ${jobId}] Failed:`, error);
    
    const failedData = {
      ...jobData,
      status: 'failed',
      error: error.message,
      errorStack: error.stack,
      errorStderr: error.stderr || null,
      errorStdout: error.stdout || null,
      errorCode: error.code || null,
      failedAt: new Date().toISOString()
    };
    
    await writeJob(jobId, failedData, 'failed');
    await deleteJob(jobId); // Remove from pending
    runningJobs.delete(jobId);
  }
};

// Delete a job
app.delete('/api/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const success = await deleteJob(jobId);
    
    if (!success) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Cancel if running
    if (runningJobs.has(jobId)) {
      const proc = runningJobs.get(jobId);
      proc.kill();
      runningJobs.delete(jobId);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel a running job
app.post('/api/job/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (runningJobs.has(jobId)) {
      const proc = runningJobs.get(jobId);
      proc.kill();
      runningJobs.delete(jobId);
    }

    await deleteJob(jobId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retry a failed job
app.post('/api/job/:jobId/retry', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await readJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Create new job with same data
    const newJobId = Date.now().toString();
    const newJobData = {
      jobId: newJobId,
      prompt: job.prompt,
      researchQuery: job.researchQuery,
      status: 'pending',
      progress: 'Starting (retry)...',
      createdAt: new Date().toISOString(),
      retriedFrom: jobId
    };

    await writeJob(newJobId, newJobData, 'pending');

    // Start processing
    processJob(newJobId, newJobData).catch(err => {
      console.error(`Retry job ${newJobId} error:`, err);
    });

    // Delete old failed job
    await deleteJob(jobId);

    res.json({ 
      success: true, 
      newJobId 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoints for backward compatibility

// Save recipe and commit to git (legacy)
app.post('/api/save-recipe', async (req, res) => {
  try {
    const { recipes, commitMessage } = req.body;

    if (!recipes || !recipes.english || !recipes.spanish) {
      return res.status(400).json({ error: 'Both English and Spanish recipes required' });
    }

    // Save English recipe
    const englishPath = path.join(REPO_PATH, recipes.english.path);
    await fs.mkdir(path.dirname(englishPath), { recursive: true });
    await fs.writeFile(englishPath, recipes.english.content, 'utf8');

    // Save Spanish recipe
    const spanishPath = path.join(REPO_PATH, recipes.spanish.path);
    await fs.mkdir(path.dirname(spanishPath), { recursive: true });
    await fs.writeFile(spanishPath, recipes.spanish.content, 'utf8');

    // Regenerate index
    await new Promise((resolve, reject) => {
      exec('node generate_manifest.js', { cwd: FRONTEND_PATH }, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Git operations
    await git.add([
      recipes.english.path,
      recipes.spanish.path,
      'frontend/index.html',
      'frontend/service-worker.js'
    ]);

    const message = commitMessage || `Add recipe: ${recipes.english.filename}`;
    await git.commit(message);

    res.json({
      success: true,
      message: 'Recipes saved and committed',
      files: [recipes.english.path, recipes.spanish.path]
    });

  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(500).json({ 
      error: 'Failed to save recipe', 
      details: error.message 
    });
  }
});

// Push to GitHub
app.post('/api/git/push', async (req, res) => {
  try {
    // Configure git remote URL with token if available
    if (GITHUB_TOKEN) {
      const remoteUrl = `https://${GITHUB_TOKEN}@github.com/PabloCortes33/recipes.git`;
      await git.remote(['set-url', 'origin', remoteUrl]);
      console.log('[Git Push] Configured git remote with token');
    }

    await git.push(GITHUB_REPO, 'main');

    res.json({
      success: true,
      message: 'Pushed to GitHub successfully'
    });

  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    res.status(500).json({ 
      error: 'Failed to push to GitHub', 
      details: error.message 
    });
  }
});

// Pull from GitHub
app.post('/api/git/pull', async (req, res) => {
  try {
    await git.pull(GITHUB_REPO, 'main');

    res.json({
      success: true,
      message: 'Pulled from GitHub successfully'
    });

  } catch (error) {
    console.error('Error pulling from GitHub:', error);
    res.status(500).json({ 
      error: 'Failed to pull from GitHub', 
      details: error.message 
    });
  }
});

// Get git status
app.get('/api/git/status', async (req, res) => {
  try {
    const status = await git.status();

    res.json({
      success: true,
      status: {
        modified: status.modified,
        created: status.created,
        deleted: status.deleted,
        ahead: status.ahead,
        behind: status.behind
      }
    });

  } catch (error) {
    console.error('Error getting git status:', error);
    res.status(500).json({ 
      error: 'Failed to get git status', 
      details: error.message 
    });
  }
});

// List recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const englishRecipes = await fs.readdir(path.join(RECIPES_PATH, 'english/recipes'));
    const spanishRecipes = await fs.readdir(path.join(RECIPES_PATH, 'spanish/recipes'));

    res.json({
      success: true,
      recipes: {
        english: englishRecipes.filter(f => f.endsWith('.md')),
        spanish: spanishRecipes.filter(f => f.endsWith('.md'))
      }
    });

  } catch (error) {
    console.error('Error listing recipes:', error);
    res.status(500).json({ 
      error: 'Failed to list recipes', 
      details: error.message 
    });
  }
});

// 404 handler for undefined routes (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🍳 Recipe Server running on port ${PORT}`);
  console.log(`📝 Repository path: ${REPO_PATH}`);
  console.log(`📚 Recipes path: ${RECIPES_PATH}`);
  console.log(`💼 Jobs path: ${JOBS_PATH}`);
  console.log(`🤖 Claude CLI path: ${CLAUDE_PATH}`);
  console.log(`🐙 GitHub Token: ${GITHUB_TOKEN ? 'Configured' : 'Not configured'}`);
  console.log(`🔒 Admin Password: ${process.env.ADMIN_PASSWORD || process.env.PASSWORD ? 'Configured' : '⚠️  NOT CONFIGURED - Admin routes unprotected!'}`);
});
