import { useState, useEffect } from 'react';
import './ServingAdjuster.css';

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

export const ServingAdjuster = ({ servings, onServingsChange, recipeMarkdown }) => {
  const originalServings = recipeMarkdown ? parseServingSize(recipeMarkdown) : 1;

  if (!originalServings || originalServings === 0) {
    return null;
  }

  return (
    <div className="serving-adjuster">
      <div className="serving-label">Servings:</div>
      <div className="serving-controls">
        <button
          className="serving-btn"
          onClick={() => onServingsChange(Math.max(1, servings - 1))}
          disabled={servings <= 1}
        >
          −
        </button>
        <div className="serving-value">{servings}</div>
        <button
          className="serving-btn"
          onClick={() => onServingsChange(servings + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
};
