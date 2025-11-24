import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModeToggle } from './ModeToggle';
import { RecipePreview } from './RecipePreview';
import { RecipeRefiner } from '../RecipeRefiner/RecipeRefiner';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StatusMessage } from '../common/StatusMessage';
import { useRecipeGeneration } from '../../hooks/useRecipeGeneration';
import { recipeAPI } from '../../services/api';
import { clearAuthToken, getUsername } from '../Auth/Login';
import './RecipeGenerator.css';

export const RecipeGenerator = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('create');
  const [prompt, setPrompt] = useState('');
  const [showRefiner, setShowRefiner] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  
  const {
    generateRecipe,
    refineRecipe,
    recipes,
    error,
    isGenerating,
    currentJobId,
    reset,
  } = useRecipeGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }
    await generateRecipe(prompt.trim(), mode);
  };

  const handleRefine = async (refinementPrompt) => {
    if (!currentJobId) {
      alert('No job ID available for refinement');
      return;
    }
    setShowRefiner(false);
    await refineRecipe(currentJobId, refinementPrompt);
  };

  const handleSave = async () => {
    if (!recipes) return;
    
    const message = prompt(`Commit message:`, `Add recipe: ${recipes.english.filename}`);
    if (!message) return;

    try {
      const response = await recipeAPI.commit(currentJobId, message);
      if (response.data.success) {
        alert('✅ Recipe committed successfully!');
        reset();
        setPrompt('');
      } else {
        alert('❌ Failed to commit recipe: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = 'https://numves.com';
  };

  const getPromptLabel = () => {
    return mode === 'create'
      ? 'What recipe would you like to create?'
      : 'Paste the recipe you want to store:';
  };

  const getPromptPlaceholder = () => {
    return mode === 'create'
      ? 'Example: roasted capsicum dip with peanuts'
      : 'Paste your recipe here (from Instagram, website, etc.)...';
  };

  const getHelpText = () => {
    return mode === 'create'
      ? '🔷 Automatically researches with Gemini, then 🤖 generates recipe with Claude CLI'
      : '🤖 Claude CLI will organize and format it to match your recipe collection structure';
  };

  const getButtonText = () => {
    return mode === 'create'
      ? '🤖 Generate Recipe'
      : '📝 Format & Store Recipe';
  };

  return (
    <div className="recipe-generator">
      <div className="generator-header">
        <div>
          <h1>🍳 AI Recipe Generator</h1>
          <div className="user-info">👤 {getUsername() || 'Admin'}</div>
        </div>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate('/browse')}>
            📚 Browse Recipes
          </Button>
          <Button variant="secondary" onClick={() => navigate('/jobs')}>
            📝 View Jobs
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            🚪 Logout
          </Button>
        </div>
      </div>

      <div className="generator-form">
        <ModeToggle mode={mode} onChange={setMode} />
        
        <div className="form-group">
          <label htmlFor="recipe-prompt">{getPromptLabel()}</label>
          <textarea
            id="recipe-prompt"
            className="recipe-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={getPromptPlaceholder()}
            rows={4}
          />
          <small className="help-text">{getHelpText()}</small>
        </div>

        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
        >
          {getButtonText()}
        </Button>

        {error && (
          <StatusMessage type="error" message={error} />
        )}

        {isGenerating && (
          <LoadingSpinner 
            message={mode === 'create' 
              ? 'Generating recipe...' 
              : 'Formatting recipe...'} 
          />
        )}

        {recipes && !showRefiner && (
          <>
            <RecipePreview
              recipes={recipes}
              mode={mode}
              onRefine={() => setShowRefiner(true)}
              onSave={handleSave}
              canRefine={mode === 'create'}
            />
          </>
        )}

        {showRefiner && (
          <RecipeRefiner
            onRefine={handleRefine}
            onCancel={() => setShowRefiner(false)}
          />
        )}
      </div>
    </div>
  );
};

