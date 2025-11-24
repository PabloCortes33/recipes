import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipesAPI } from '../../services/api';
import { RecipeFolder } from './RecipeFolder';
import { RecipeIdeas } from '../RecipeIdeas/RecipeIdeas';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StatusMessage } from '../common/StatusMessage';
import { Button } from '../common/Button';
import './RecipeBrowser.css';

export const RecipeBrowser = () => {
  const navigate = useNavigate();
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIdeas, setShowIdeas] = useState(false);

  useEffect(() => {
    loadManifest();
  }, []);

  const loadManifest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recipesAPI.getManifest();
      setManifest(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  if (showIdeas) {
    return <RecipeIdeas onBack={() => setShowIdeas(false)} />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading recipes..." />;
  }

  if (error) {
    return <StatusMessage type="error" message={error} />;
  }

  if (!manifest || !manifest.structure) {
    return <StatusMessage type="error" message="No recipes found" />;
  }

  const englishSection = manifest.structure.find(item => item.name === 'english');
  const spanishSection = manifest.structure.find(item => item.name === 'spanish');

  return (
    <div className="recipe-browser">
      <div className="browser-header">
        <div>
          <h1>🍳 Recipes Collection</h1>
          <div className="browser-subtitle">
            Browse recipes organized by language and category
          </div>
        </div>
        <div className="browser-header-actions">
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = 'https://dash.numves.com'}
            aria-label="Go to admin panel"
          >
            ⚙️ Admin
          </Button>
          <button 
            className="ideas-tab-btn" 
            onClick={() => setShowIdeas(true)}
            aria-label="Open recipe ideas"
          >
            💡 Recipe Ideas
          </button>
        </div>
      </div>

      <div className="browser-container">
        {englishSection && (
          <div className="language-section">
            <h2>🇬🇧 English</h2>
            {englishSection.children?.map((child) => (
              <RecipeFolder key={child.path} folder={child} isSpanish={false} />
            ))}
          </div>
        )}

        {spanishSection && (
          <div className="language-section">
            <h2>🇪🇸 Español</h2>
            {spanishSection.children?.map((child) => (
              <RecipeFolder key={child.path} folder={child} isSpanish={true} />
            ))}
          </div>
        )}
      </div>

      <div className="browser-timestamp">
        Last updated: {manifest.generated ? new Date(manifest.generated).toLocaleString() : 'Unknown'}
      </div>
    </div>
  );
};

