import { Button } from '../common/Button';
import './RecipePreview.css';

export const RecipePreview = ({ recipes, mode, onRefine, onSave, canRefine = false }) => {
  const subtitle = mode === 'create'
    ? '🔷 Gemini Research → 🤖 Claude CLI Generation'
    : '🤖 Claude CLI Formatting';

  return (
    <div className="recipe-preview">
      <h3>{mode === 'create' ? 'Generated' : 'Formatted'} Recipes</h3>
      <p className="recipe-subtitle">{subtitle}</p>
      
      <div className="recipe-section">
        <h4>🇬🇧 English: {recipes.english.filename}</h4>
        <pre className="recipe-content">{recipes.english.content}</pre>
      </div>
      
      <div className="recipe-section">
        <h4>🇪🇸 Spanish: {recipes.spanish.filename}</h4>
        <pre className="recipe-content">{recipes.spanish.content}</pre>
      </div>
      
      <div className="recipe-actions">
        {canRefine && (
          <Button variant="primary" onClick={onRefine}>
            ✨ Refine Recipe
          </Button>
        )}
        <Button variant="success" onClick={onSave}>
          💾 Save & Commit
        </Button>
      </div>
    </div>
  );
};

