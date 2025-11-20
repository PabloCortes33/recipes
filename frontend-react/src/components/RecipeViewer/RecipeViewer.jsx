import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { recipesAPI } from '../../services/api';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StatusMessage } from '../common/StatusMessage';
import { ServingAdjuster } from './ServingAdjuster';
import './RecipeViewer.css';

export const RecipeViewer = () => {
  const { path } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    if (path) {
      loadRecipe(decodeURIComponent(path));
    }
  }, [path]);

  const loadRecipe = async (recipePath) => {
    try {
      setLoading(true);
      setError(null);
      const response = await recipesAPI.getRecipe(recipePath);
      const markdown = response.data;
      setRecipe(markdown);
      const parsedHtml = marked.parse(markdown);
      setHtml(parsedHtml);
      
      // Parse initial serving size
      const initialServings = parseServingSize(markdown);
      setServings(initialServings);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const parseServingSize = (markdown) => {
    const patterns = [
      /(?:Yields?|Servings?|Serves?):\s*(\d+)\s*servings?/i,
      /(?:Yields?|Servings?|Serves?):\s*(\d+)/i,
      /(\d+)\s*servings?/i,
    ];

    for (const pattern of patterns) {
      const match = markdown.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return 1;
  };

  const handleRefactor = () => {
    if (recipe) {
      const refactorPrompt = `Refactor this recipe:\n\n${recipe}`;
      navigator.clipboard.writeText(refactorPrompt).then(() => {
        alert('✓ Recipe copied to clipboard! Paste into Claude.');
      }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = refactorPrompt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('✓ Recipe copied to clipboard! Paste into Claude.');
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading recipe..." />;
  }

  if (error) {
    return (
      <div className="recipe-viewer">
        <Button variant="primary" onClick={() => navigate('/browse')}>
          ← Back to Recipes
        </Button>
        <StatusMessage type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="recipe-viewer">
      <div className="viewer-actions">
        <Button variant="primary" onClick={() => navigate('/browse')}>
          ← Back to Recipes
        </Button>
        <Button variant="success" onClick={handleRefactor}>
          🤖 Refactor with AI
        </Button>
      </div>

      {recipe && (
        <ServingAdjuster
          servings={servings}
          onServingsChange={setServings}
          recipeMarkdown={recipe}
        />
      )}

      <div
        className="recipe-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

