# 🍳 AI Recipe Generator Server

A Node.js server that enables AI-powered recipe generation with automatic git integration.

## Features

- 🤖 **AI Recipe Generation** - Uses Claude to create recipes based on your prompts
- 🔬 **Research Integration** - Automatically researches topics before generating
- 🌍 **Bilingual** - Generates both English and Spanish versions automatically
- 📝 **Git Integration** - Auto-commit and push to GitHub
- 🔒 **Simple Auth** - Password-protected for personal use
- 📱 **Web UI** - Clean, mobile-friendly interface

## Quick Start (Local Development)

```bash
cd backend

# Run setup script (creates .env and guides you through configuration)
./setup.sh

# OR manually:
# cp ENV_EXAMPLE.txt .env
# nano .env  # Add your real API keys

# Install and start
npm install
npm start

# Open browser
open http://localhost:3000
```

**🔒 Security**: Your `.env` file is automatically gitignored. Never commit secrets!

## API Endpoints

### Authentication
All endpoints except `/api/health` require `Authorization: Bearer YOUR_PASSWORD` header.

### POST `/api/generate-recipe`
Generate a new recipe using AI.

**Body:**
```json
{
  "prompt": "Create a recipe for Turkish Çılbır",
  "researchQuery": "Turkish egg dishes and yogurt sauces" // optional
}
```

**Response:**
```json
{
  "success": true,
  "recipes": {
    "english": {
      "content": "# Recipe content...",
      "filename": "cilbir.md",
      "path": "english/recipes/cilbir.md"
    },
    "spanish": {
      "content": "# Contenido receta...",
      "filename": "cilbir.md",
      "path": "spanish/recipes/cilbir.md"
    }
  }
}
```

### POST `/api/save-recipe`
Save generated recipes and commit to git.

**Body:**
```json
{
  "recipes": { /* recipes object from generate-recipe */ },
  "commitMessage": "Add new recipe"
}
```

### POST `/api/git/push`
Push commits to GitHub.

### POST `/api/git/pull`
Pull latest changes from GitHub.

### GET `/api/git/status`
Get current git status.

## Environment Variables

See `ENV_EXAMPLE.txt` for all required environment variables.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Railway deployment instructions.

## Workflow

1. Open web UI
2. (Optional) Enter research query
3. Enter recipe generation prompt
4. Click "Generate Recipe"
5. Review generated recipes (English + Spanish)
6. Click "Save & Commit"
7. Click "Push to GitHub"
8. Done!

Your recipes are now:
- ✅ Saved to the server
- ✅ Committed to git
- ✅ Pushed to GitHub
- ✅ Ready to pull on your local machine

## Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-restart)
npm run dev

# Run in production mode
npm start
```

## Tech Stack

- **Express.js** - Web server
- **Anthropic SDK** - Claude API integration
- **simple-git** - Git operations
- **dotenv** - Environment configuration

## Security Notes

- Use a strong `AUTH_PASSWORD`
- Keep your `ANTHROPIC_API_KEY` secret
- Never commit `.env` file to git
- Use GitHub Personal Access Token with minimal permissions (just `repo`)

## License

Personal use project - part of the recipes collection.

