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

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const REPO_PATH = process.env.REPO_PATH || path.join(__dirname, '..');
const RECIPES_PATH = path.join(REPO_PATH, 'recipes');
const FRONTEND_PATH = path.join(REPO_PATH, 'frontend');
const JOBS_PATH = path.join(REPO_PATH, 'backend', '.jobs');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'origin';

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
app.use(express.static(path.join(__dirname, 'public')));

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
    const { prompt, researchQuery } = jobData;
    
    // Update status: Researching
    if (researchQuery) {
      jobData.status = 'researching';
      jobData.progress = 'Researching with Gemini...';
      await writeJob(jobId, jobData, 'pending');
    }

    // Do research if requested
    let researchContext = '';
    if (researchQuery) {
      try {
        const escapedQuery = researchQuery.replace(/'/g, "'\\''");
        const researchPrompt = `Research the following topic and provide detailed information that will help create a recipe:\n\n${escapedQuery}\n\nProvide specific details about ingredients, techniques, cultural context, and any important variations.`;
        const escapedResearchPrompt = researchPrompt.replace(/'/g, "'\\''");
        
        const { stdout, stderr } = await execPromise(`claude -p '@gemini-research-expert ${escapedResearchPrompt}'`, {
          timeout: 120000 // 2 minute timeout
        });
        if (stderr) console.error('Research stderr:', stderr);
        researchContext = stdout.trim();
        console.log(`[Job ${jobId}] Research completed`);
        
        jobData.researchContext = researchContext;
        await writeJob(jobId, jobData, 'pending');
      } catch (error) {
        console.error(`[Job ${jobId}] Research failed:`, error.message);
        // Continue without research
      }
    }

    // Update status: Generating
    jobData.status = 'generating';
    jobData.progress = 'Generating recipe with Claude CLI...';
    await writeJob(jobId, jobData, 'pending');

    // Build recipe prompt
    const fullPrompt = researchContext 
      ? `Based on this research:\n\n${researchContext}\n\n---\n\nNow, ${prompt}`
      : prompt;

    const recipePrompt = `${fullPrompt}\n\nIMPORTANT: Generate TWO versions of the recipe:
1. English version (save as recipes/english/recipes/[recipe_name].md)
2. Spanish version (save as recipes/spanish/recipes/[recipe_name].md)

For each version:
- Use proper markdown format
- Include: title, description, yields, prep/cook time
- Organize: Ingredients section with proper grouping
- Organize: Instructions section with clear steps
- Use the same structure as existing recipes in the collection
- Keep the recipe name consistent between versions (translated)

Provide your response in this format:
===ENGLISH===
[full recipe markdown]
===SPANISH===
[full recipe markdown]
===FILENAMES===
English: [filename].md
Spanish: [filename].md`;

    // Generate recipe
    const escapedRecipePrompt = recipePrompt.replace(/'/g, "'\\''");
    
    const { stdout, stderr } = await execPromise(`claude -p '${escapedRecipePrompt}'`, {
      timeout: 180000 // 3 minute timeout
    });
    if (stderr) console.error('Claude stderr:', stderr);
    const response = stdout.trim();
    console.log(`[Job ${jobId}] Recipe generated`);

    // Parse response
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
      progress: 'Recipe generated successfully',
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
    
    // Move to failed
    const failedData = {
      ...jobData,
      status: 'failed',
      error: error.message,
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

// Start recipe generation (returns jobId immediately)
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { prompt, researchQuery } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create job
    const jobId = Date.now().toString();
    const jobData = {
      jobId,
      prompt,
      researchQuery: researchQuery || null,
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

  } catch (error) {
    console.error('Error starting job:', error);
    res.status(500).json({ 
      error: 'Failed to start job', 
      details: error.message 
    });
  }
});

// Get job status
app.get('/api/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await readJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all jobs
app.get('/api/jobs', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Commit a draft (save to recipes folder and commit to git)
app.post('/api/job/:jobId/commit', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { commitMessage } = req.body;
    
    const job = await readJob(jobId);
    
    if (!job || job.folder !== 'completed') {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const { recipes } = job;

    // Save English recipe
    const englishPath = path.join(REPO_PATH, recipes.english.path);
    await fs.mkdir(path.dirname(englishPath), { recursive: true });
    await fs.writeFile(englishPath, recipes.english.content, 'utf8');

    // Save Spanish recipe
    const spanishPath = path.join(REPO_PATH, recipes.spanish.path);
    await fs.mkdir(path.dirname(spanishPath), { recursive: true });
    await fs.writeFile(spanishPath, recipes.spanish.content, 'utf8');

    // Regenerate manifest
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

    // Push to GitHub
    if (GITHUB_TOKEN) {
      await git.addConfig('credential.helper', 'store');
    }
    await git.push(GITHUB_REPO, 'main');

    // Move job to committed
    await moveJob(jobId, 'completed', 'committed');

    res.json({
      success: true,
      message: 'Recipe committed and pushed to GitHub'
    });

  } catch (error) {
    console.error('Error committing job:', error);
    res.status(500).json({ 
      error: 'Failed to commit recipe', 
      details: error.message 
    });
  }
});

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
    if (GITHUB_TOKEN) {
      await git.addConfig('credential.helper', 'store');
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

// Start server
app.listen(PORT, () => {
  console.log(`🍳 Recipe Server running on port ${PORT}`);
  console.log(`📝 Repository path: ${REPO_PATH}`);
  console.log(`📚 Recipes path: ${RECIPES_PATH}`);
  console.log(`💼 Jobs path: ${JOBS_PATH}`);
  console.log(`🐙 GitHub Token: ${GITHUB_TOKEN ? 'Configured' : 'Not configured'}`);
});
