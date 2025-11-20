import { useNavigate } from 'react-router-dom';
import './RecipeFile.css';

const formatFileName = (name) => {
  return name
    .replace(/_/g, ' ')
    .replace(/\.md$/, '')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const RecipeFile = ({ file }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${encodeURIComponent(file.path)}`);
  };

  return (
    <div className="recipe-file">
      <a onClick={handleClick} className="file-link">
        {formatFileName(file.name)}
      </a>
    </div>
  );
};

