import { useState } from 'react';
import { RecipeFile } from './RecipeFile';
import './RecipeFolder.css';

/**
 * Format folder name with proper Unicode support
 * Fixes text truncation issues with special characters like "ñ", "á", etc.
 */
const formatName = (name, isSpanish = false) => {
  if (!name) return '';

  const translations = {
    'bakery': 'Panadería',
    'methods': 'Métodos',
    'recipes': 'Recetas',
    'sauces': 'Salsas',
    'spices': 'Especias',
    'english': 'English',
    'spanish': 'Español',
  };

  const lowerName = name.toLowerCase();
  
  if (isSpanish && translations[lowerName]) {
    return translations[lowerName];
  }
  
  if (translations[lowerName]) {
    return translations[lowerName];
  }

  return name
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim()
    // Properly capitalize first letter of each word (Unicode-aware)
    .replace(/(?:^|\s)([^\s])/g, (match, char) => {
      return match.replace(char, char.toUpperCase());
    });
};

export const RecipeFolder = ({ folder, isSpanish = false, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  if (!folder.children || folder.children.length === 0) {
    return null;
  }

  return (
    <div className="recipe-folder">
      <div
        className="folder-name"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${formatName(folder.name, isSpanish)} folder`}
      >
        <span className="folder-icon">{isExpanded ? '📂' : '📁'}</span>
        {formatName(folder.name, isSpanish)}
      </div>
      {isExpanded && (
        <div className="folder-contents">
          {folder.children.map((child) => {
            if (child.type === 'folder') {
              return (
                <RecipeFolder
                  key={child.path}
                  folder={child}
                  isSpanish={isSpanish}
                  level={level + 1}
                />
              );
            } else if (child.type === 'file') {
              return (
                <RecipeFile
                  key={child.path}
                  file={child}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

