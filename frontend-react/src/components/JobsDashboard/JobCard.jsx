import { Button } from '../common/Button';
import './JobCard.css';

export const JobCard = ({ job, onView, onCommit, onRetry, onDelete, onViewError }) => {
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusBadge = () => {
    switch (job.status) {
      case 'pending':
      case 'researching':
      case 'generating':
      case 'formatting':
      case 'refining':
        return <span className="job-status status-in-progress">⏳ In Progress</span>;
      case 'completed':
        return <span className="job-status status-completed">✅ Ready</span>;
      case 'failed':
        return <span className="job-status status-failed">❌ Failed</span>;
      default:
        return <span className="job-status">{job.status}</span>;
    }
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <span className="job-id">Job #{job.jobId}</span>
        {getStatusBadge()}
      </div>
      <div className="job-content">
        <div className="job-prompt">
          📄 {job.recipes?.english?.filename || job.prompt}
        </div>
        {job.researchContext && (
          <div className="job-research">🔷 Used research</div>
        )}
        <div className="job-time">
          {job.status === 'completed' && job.completedAt && `Completed: ${formatTimeAgo(job.completedAt)}`}
          {job.status === 'failed' && job.failedAt && `Failed: ${formatTimeAgo(job.failedAt)}`}
          {job.status === 'pending' && job.createdAt && `Started: ${formatTimeAgo(job.createdAt)}`}
        </div>
        {job.error && (
          <div className="job-error">Error: {job.error}</div>
        )}
      </div>
      <div className="job-actions">
        {job.status === 'completed' && (
          <>
            <Button variant="primary" className="btn-small" onClick={() => onView(job.jobId)}>
              👁️ View Recipe
            </Button>
            <Button variant="success" className="btn-small" onClick={() => onCommit(job.jobId)}>
              ✅ Commit & Push
            </Button>
            <Button variant="danger" className="btn-small" onClick={() => onDelete(job.jobId)}>
              🗑️ Delete
            </Button>
          </>
        )}
        {job.status === 'failed' && (
          <>
            <Button variant="primary" className="btn-small" onClick={() => onViewError(job.jobId)}>
              📋 View Full Error
            </Button>
            <Button variant="primary" className="btn-small" onClick={() => onRetry(job.jobId)}>
              🔄 Retry
            </Button>
            <Button variant="danger" className="btn-small" onClick={() => onDelete(job.jobId)}>
              🗑️ Delete
            </Button>
          </>
        )}
        {(job.status === 'pending' || job.status === 'researching' || job.status === 'generating' || job.status === 'formatting' || job.status === 'refining') && (
          <Button variant="danger" className="btn-small" onClick={() => onDelete(job.jobId)}>
            🗑️ Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

