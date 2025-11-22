import { useNavigate } from 'react-router-dom';
import './RecipeFile.css';

/**
 * Format file name with proper Unicode support
 * Fixes text truncation issues with special characters
 */
const formatFileName = (name) => {
  if (!name) return '';
  
  return name
    .replace(/_/g, ' ')
    .replace(/\.md$/, '')
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim()
    // Properly capitalize first letter of each word (Unicode-aware)
    .replace(/(?:^|\s)([^\s])/g, (match, char) => {
      return match.replace(char, char.toUpperCase());
    });
};

export const RecipeFile = ({ file }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${encodeURIComponent(file.path)}`);
  };

  return (
    <div className="recipe-file">
      <a 
        onClick={handleClick} 
        className="file-link"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`View recipe: ${formatFileName(file.name)}`}
      >
        {formatFileName(file.name)}
      </a>
    </div>
  );
};

