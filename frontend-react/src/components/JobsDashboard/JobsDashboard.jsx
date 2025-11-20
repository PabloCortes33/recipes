import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobCard } from './JobCard';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StatusMessage } from '../common/StatusMessage';
import { jobsAPI, recipeAPI } from '../../services/api';
import './JobsDashboard.css';

export const JobsDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState({ inProgress: [], drafts: [], failed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedError, setExpandedError] = useState(null);
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsAPI.list();
      setJobs(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCommit = async (jobId) => {
    if (!confirm('Commit this recipe and push to GitHub?')) return;

    try {
      const commitMessage = prompt('Commit message:', `Add recipe`);
      if (!commitMessage) return;

      const response = await recipeAPI.commit(jobId, commitMessage);
      if (response.data.success) {
        alert('✅ Recipe committed and pushed to GitHub!');
        loadJobs();
      } else {
        alert('❌ Error: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error committing recipe: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRetry = async (jobId) => {
    if (!confirm('Retry this failed job?')) return;

    try {
      await jobsAPI.retry(jobId);
      loadJobs();
    } catch (err) {
      alert('Error retrying job: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job permanently?')) return;

    try {
      await jobsAPI.delete(jobId);
      loadJobs();
    } catch (err) {
      alert('Error deleting job: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleViewError = async (jobId) => {
    try {
      const response = await jobsAPI.get(jobId);
      const job = response.data;
      setExpandedError(expandedError === jobId ? null : jobId);
    } catch (err) {
      alert('Error loading error details: ' + err.message);
    }
  };

  const handleViewRecipe = async (jobId) => {
    try {
      const response = await jobsAPI.get(jobId);
      const job = response.data;
      setExpandedRecipe(expandedRecipe === jobId ? null : jobId);
    } catch (err) {
      alert('Error loading recipe: ' + err.message);
    }
  };

  const renderErrorDetails = (job) => {
    if (expandedError !== job.jobId) return null;

    return (
      <div className="error-details">
        <h4>📋 Full Error Details</h4>
        <div className="error-section">
          <strong>Error Message:</strong>
          <pre>{job.error || 'No error message'}</pre>
        </div>
        {job.errorStderr && (
          <div className="error-section">
            <strong>Stderr:</strong>
            <pre>{job.errorStderr}</pre>
          </div>
        )}
        {job.errorStdout && (
          <div className="error-section">
            <strong>Stdout:</strong>
            <pre>{job.errorStdout}</pre>
          </div>
        )}
        {job.errorStack && (
          <div className="error-section">
            <strong>Stack Trace:</strong>
            <pre>{job.errorStack}</pre>
          </div>
        )}
        {job.errorCode !== null && (
          <div className="error-section">
            <strong>Exit Code:</strong> {job.errorCode}
          </div>
        )}
      </div>
    );
  };

  const renderRecipePreview = (job) => {
    if (expandedRecipe !== job.jobId || !job.recipes) return null;

    return (
      <div className="recipe-preview-expanded">
        <h4>🇬🇧 English: {job.recipes.english.filename}</h4>
        <pre>{job.recipes.english.content.substring(0, 500)}...</pre>
        <br />
        <h4>🇪🇸 Spanish: {job.recipes.spanish.filename}</h4>
        <pre>{job.recipes.spanish.content.substring(0, 500)}...</pre>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading jobs..." />;
  }

  return (
    <div className="jobs-dashboard">
      <div className="dashboard-header">
        <h1>📝 Jobs Dashboard</h1>
        <div className="dashboard-actions">
          <Button variant="secondary" onClick={() => navigate('/')}>
            ← Back to Generator
          </Button>
          <Button variant="primary" onClick={loadJobs}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {error && <StatusMessage type="error" message={error} />}

      <div className="jobs-sections">
        <div className="jobs-section">
          <h2>⏳ In Progress ({jobs.inProgress.length})</h2>
          {jobs.inProgress.length === 0 ? (
            <p className="empty-state">No jobs in progress</p>
          ) : (
            jobs.inProgress.map((job) => (
              <div key={job.jobId}>
                <JobCard
                  job={job}
                  onView={handleViewRecipe}
                  onCommit={handleCommit}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                  onViewError={handleViewError}
                />
                {renderRecipePreview(job)}
              </div>
            ))
          )}
        </div>

        <div className="jobs-section">
          <h2>✅ Drafts ({jobs.drafts.length})</h2>
          {jobs.drafts.length === 0 ? (
            <p className="empty-state">No draft recipes</p>
          ) : (
            jobs.drafts.map((job) => (
              <div key={job.jobId}>
                <JobCard
                  job={job}
                  onView={handleViewRecipe}
                  onCommit={handleCommit}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                  onViewError={handleViewError}
                />
                {renderRecipePreview(job)}
              </div>
            ))
          )}
        </div>

        <div className="jobs-section">
          <h2>❌ Failed ({jobs.failed.length})</h2>
          {jobs.failed.length === 0 ? (
            <p className="empty-state">No failed jobs</p>
          ) : (
            jobs.failed.map((job) => (
              <div key={job.jobId}>
                <JobCard
                  job={job}
                  onView={handleViewRecipe}
                  onCommit={handleCommit}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                  onViewError={handleViewError}
                />
                {renderErrorDetails(job)}
                {renderRecipePreview(job)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

