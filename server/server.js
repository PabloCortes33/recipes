const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const simpleGit = require('simple-git');
const Anthropic = require('anthropic');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const REPO_PATH = process.env.REPO_PATH || path.join(__dirname, '../');
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'change-me-please';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'origin';

// Initialize git
const git = simpleGit(REPO_PATH);

// Initialize Anthropic
let anthropic = null;
if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${AUTH_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    hasAnthropicKey: !!ANTHROPIC_API_KEY,
    hasGitHubToken: !!GITHUB_TOKEN
  });
});

// Generate recipe with AI
app.post('/api/generate-recipe', authMiddleware, async (req, res) => {
  try {
    if (!anthropic) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    const { prompt, researchQuery } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // First, do research if requested
    let researchContext = '';
    if (researchQuery) {
      const researchMessage = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `You are a research expert. Research the following topic and provide detailed information that will help create a recipe:\n\n${researchQuery}\n\nProvide specific details about ingredients, techniques, cultural context, and any important variations.`
        }]
      });

      researchContext = researchMessage.content[0].text;
    }

    // Generate the recipe
    const fullPrompt = researchContext 
      ? `Based on this research:\n\n${researchContext}\n\n---\n\nNow, ${prompt}`
      : prompt;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: `${fullPrompt}\n\nIMPORTANT: Generate TWO versions of the recipe:
1. English version (save as english/recipes/[recipe_name].md)
2. Spanish version (save as spanish/recipes/[recipe_name].md)

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
Spanish: [filename].md`
      }]
    });

    const response = message.content[0].text;
    
    // Parse the response
    const englishMatch = response.match(/===ENGLISH===\n([\s\S]*?)===SPANISH===/);
    const spanishMatch = response.match(/===SPANISH===\n([\s\S]*?)===FILENAMES===/);
    const filenamesMatch = response.match(/===FILENAMES===\n([\s\S]*?)$/);

    if (!englishMatch || !spanishMatch) {
      return res.json({
        success: false,
        message: 'Generated content but could not parse recipe format',
        rawResponse: response
      });
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

    res.json({
      success: true,
      recipes: {
        english: {
          content: englishRecipe,
          filename: englishFilename,
          path: `english/recipes/${englishFilename}`
        },
        spanish: {
          content: spanishRecipe,
          filename: spanishFilename,
          path: `spanish/recipes/${spanishFilename}`
        }
      },
      researchContext: researchContext || null
    });

  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ 
      error: 'Failed to generate recipe', 
      details: error.message 
    });
  }
});

// Save recipe and commit to git
app.post('/api/save-recipe', authMiddleware, async (req, res) => {
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
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec('node generate_manifest.js', { cwd: REPO_PATH }, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });

    // Git operations
    await git.add([
      recipes.english.path,
      recipes.spanish.path,
      'index.html',
      'service-worker.js'
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
app.post('/api/git/push', authMiddleware, async (req, res) => {
  try {
    if (GITHUB_TOKEN) {
      // Configure git with token
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
app.post('/api/git/pull', authMiddleware, async (req, res) => {
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
app.get('/api/git/status', authMiddleware, async (req, res) => {
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
app.get('/api/recipes', authMiddleware, async (req, res) => {
  try {
    const englishRecipes = await fs.readdir(path.join(REPO_PATH, 'english/recipes'));
    const spanishRecipes = await fs.readdir(path.join(REPO_PATH, 'spanish/recipes'));

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
  console.log(`🔑 Anthropic API: ${ANTHROPIC_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🐙 GitHub Token: ${GITHUB_TOKEN ? 'Configured' : 'Not configured'}`);
});

