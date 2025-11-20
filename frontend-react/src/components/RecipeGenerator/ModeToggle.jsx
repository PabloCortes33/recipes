import './ModeToggle.css';

export const ModeToggle = ({ mode, onChange }) => {
  return (
    <div className="mode-toggle">
      <label className="mode-label">
        <input
          type="radio"
          name="mode"
          value="create"
          checked={mode === 'create'}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>✨ Create Recipe</span>
      </label>
      <label className="mode-label">
        <input
          type="radio"
          name="mode"
          value="store"
          checked={mode === 'store'}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>📝 Store Recipe</span>
      </label>
    </div>
  );
};

