import './StatusMessage.css';

export const StatusMessage = ({ type = 'info', message, children }) => {
  return (
    <div className={`status status-${type}`}>
      {message || children}
    </div>
  );
};

