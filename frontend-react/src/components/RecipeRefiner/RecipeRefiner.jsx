import { useState } from 'react';
import { Button } from '../common/Button';
import './RecipeRefiner.css';

export const RecipeRefiner = ({ onRefine, onCancel }) => {
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (refinementPrompt.trim()) {
      onRefine(refinementPrompt.trim());
      setRefinementPrompt('');
    }
  };

  return (
    <div className="recipe-refiner">
      <h3>✨ Refine Recipe</h3>
      <p className="refiner-help">
        What would you like to change or improve in this recipe?
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          className="refiner-input"
          value={refinementPrompt}
          onChange={(e) => setRefinementPrompt(e.target.value)}
          placeholder="Examples:&#10;- Make it spicier&#10;- Add more vegetables&#10;- Reduce cooking time&#10;- Make it healthier"
          rows={6}
        />
        <div className="refiner-actions">
          <Button type="submit" variant="primary" disabled={!refinementPrompt.trim()}>
            Refine Recipe
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

