# React Frontend for Recipe Generator

This is the React frontend application for the AI Recipe Generator.

## Development

```bash
# Install dependencies
npm install

# Start development server (with proxy to backend)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root of `frontend-react/`:

```env
VITE_API_URL=http://localhost:3000
```

## Project Structure

```
src/
├── components/
│   ├── RecipeGenerator/    # Main recipe generation UI
│   ├── JobsDashboard/      # Jobs management dashboard
│   ├── RecipeRefiner/      # Recipe refinement component
│   └── common/             # Reusable components
├── hooks/
│   ├── useJobPolling.js    # Hook for polling job status
│   └── useRecipeGeneration.js  # Hook for recipe generation
├── services/
│   └── api.js              # API client
├── App.jsx                  # Main app component with routing
└── main.jsx                 # Entry point
```

## Features

- ✨ Create Recipe mode with automatic Gemini research
- 📝 Store Recipe mode for formatting existing recipes
- 🔄 Recipe refinement (brainstorming) for create mode
- 📊 Jobs Dashboard for managing all recipe jobs
- 🔄 Real-time job status polling
- 💾 Save and commit recipes to Git

## API Integration

The frontend communicates with the backend API at `http://localhost:3000` (or configured `VITE_API_URL`).

All API calls are centralized in `src/services/api.js` for easy maintenance.
