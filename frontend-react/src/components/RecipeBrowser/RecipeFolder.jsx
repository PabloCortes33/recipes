import { useState } from 'react';
import { RecipeFile } from './RecipeFile';
import './RecipeFolder.css';

const formatName = (name, isSpanish = false) => {
  const translations = {
    'bakery': 'Panadería',
    'methods': 'Métodos',
    'recipes': 'Recetas',
    'sauces': 'Salsas',
    'spices': 'Especias',
  };

  if (isSpanish && translations[name.toLowerCase()]) {
    return translations[name.toLowerCase()];
  }

  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
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

