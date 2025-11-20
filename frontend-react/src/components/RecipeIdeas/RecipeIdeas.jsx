import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import './RecipeIdeas.css';

export const RecipeIdeas = ({ onBack }) => {
  const [ideas, setIdeas] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('recipeIdeas');
    if (saved) {
      setIdeas(saved);
    }
  }, []);

  useEffect(() => {
    // Auto-save to localStorage
    if (ideas !== '') {
      localStorage.setItem('recipeIdeas', ideas);
    }
  }, [ideas]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(ideas);
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = ideas;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    if (confirm('Clear all recipe ideas?')) {
      setIdeas('');
      localStorage.removeItem('recipeIdeas');
    }
  };

  return (
    <div className="recipe-ideas">
      <div className="ideas-header">
        <h1>💡 Recipe Ideas</h1>
        <Button variant="secondary" onClick={onBack}>
          ← Back to Recipes
        </Button>
      </div>

      <div className="ideas-info">
        💭 Use this space to brainstorm recipe ideas on your phone. Auto-saves as you type. Click "Copy All" to paste into Claude or your AI tool later!
      </div>

      <textarea
        className="ideas-textarea"
        value={ideas}
        onChange={(e) => setIdeas(e.target.value)}
        placeholder="Jot down your recipe ideas here...

Example:
- Try making Turkish eggs with sriracha instead of Aleppo pepper
- Experiment with sweet potato gnocchi
- Air fryer version of grandma's empanadas

Your ideas are automatically saved to this device."
        rows={15}
      />

      <div className="ideas-actions">
        <Button variant="primary" onClick={handleCopy} disabled={!ideas.trim()}>
          📋 Copy All
        </Button>
        <Button variant="secondary" onClick={handleClear} disabled={!ideas.trim()}>
          🗑️ Clear
        </Button>
        {copied && <span className="copy-feedback">✓ Copied!</span>}
      </div>
    </div>
  );
};

