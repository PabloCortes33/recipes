import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobsTable } from './JobsTable';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StatusMessage } from '../common/StatusMessage';
import { jobsAPI, recipeAPI } from '../../services/api';
import { clearAuthToken, getUsername } from '../Auth/Login';
import './JobsDashboard.css';

export const JobsDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState({ pending: [], drafts: [], reviewing: [], failed: [] });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadJobs = async (silent = false) => {
    try {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await jobsAPI.list();
      setJobs(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load jobs');
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = 'https://numves.com';
  };

  useEffect(() => {
    loadJobs(false); // Initial load - show spinner
    const interval = setInterval(() => loadJobs(true), 5000); // Silent refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCommit = async (jobId, commitMessage = null) => {
    // If no commit message provided (called from card view), prompt for it
    if (!commitMessage) {
      if (!confirm('Commit this recipe and push to GitHub?')) return;
      commitMessage = prompt('Commit message:', `Add recipe`);
      if (!commitMessage) return;
    }

    try {
      const response = await recipeAPI.commit(jobId, commitMessage);
      if (response.data.success) {
        alert('✅ Recipe committed and pushed to GitHub!');
        loadJobs(true); // Silent refresh after commit
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
      loadJobs(true); // Silent refresh after retry
    } catch (err) {
      alert('Error retrying job: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job permanently?')) return;

    try {
      await jobsAPI.delete(jobId);
      loadJobs(true); // Silent refresh after delete
    } catch (err) {
      alert('Error deleting job: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRefine = async (jobId, refinementPrompt) => {
    try {
      const response = await recipeAPI.refine(jobId, refinementPrompt);
      if (response.data.success) {
        setRefiningJobId(null);
        alert('✨ Refinement started! Check the "In Progress" section.');
        loadJobs(true); // Silent refresh after starting refinement
      } else {
        alert('❌ Error: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error refining recipe: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleStartReview = async (jobId) => {
    try {
      const response = await jobsAPI.startReview(jobId);
      if (response.data.success) {
        loadJobs(true); // Silent refresh after moving to reviewing
      } else {
        alert('❌ Error: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error starting review: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleReturnToDrafts = async (jobId) => {
    try {
      const response = await jobsAPI.returnToDrafts(jobId);
      if (response.data.success) {
        loadJobs(true); // Silent refresh after returning to drafts
      } else {
        alert('❌ Error: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error returning to drafts: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleViewError = async (jobId) => {
    try {
      const response = await jobsAPI.get(jobId);
      const job = response.data;

      // Format error details
      let errorMsg = `Error Details for Job #${jobId}\n\n`;
      errorMsg += `Error: ${job.error || 'No error message'}\n\n`;
      if (job.errorStderr) errorMsg += `Stderr:\n${job.errorStderr}\n\n`;
      if (job.errorStdout) errorMsg += `Stdout:\n${job.errorStdout}\n\n`;
      if (job.errorStack) errorMsg += `Stack:\n${job.errorStack}\n`;

      alert(errorMsg);
    } catch (err) {
      alert('Error loading error details: ' + err.message);
    }
  };

  const handleViewRecipe = async (jobId) => {
    try {
      const response = await jobsAPI.get(jobId);
      const job = response.data;

      if (!job.recipes) {
        alert('No recipe data available');
        return;
      }

      // Format recipe preview
      let recipeMsg = `Recipe Preview for Job #${jobId}\n\n`;
      if (job.recipes.english) {
        recipeMsg += `🇬🇧 English: ${job.recipes.english.filename}\n\n`;
        recipeMsg += `${job.recipes.english.content.substring(0, 500)}...\n\n`;
      }
      if (job.recipes.spanish) {
        recipeMsg += `🇪🇸 Spanish: ${job.recipes.spanish.filename}\n\n`;
        recipeMsg += `${job.recipes.spanish.content.substring(0, 500)}...\n`;
      }

      alert(recipeMsg);
    } catch (err) {
      alert('Error loading recipe: ' + err.message);
    }
  };

  // Only show full-page spinner on initial load
  if (loading && (!jobs.pending || jobs.pending.length === 0) && (!jobs.drafts || jobs.drafts.length === 0) && (!jobs.reviewing || jobs.reviewing.length === 0) && (!jobs.failed || jobs.failed.length === 0)) {
    return <LoadingSpinner message="Loading jobs..." />;
  }

  return (
    <div className="jobs-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>📝 Jobs Dashboard</h1>
          <div className="user-info">👤 {getUsername() || 'Admin'}</div>
        </div>
        <div className="dashboard-actions">
          <Button variant="secondary" onClick={() => navigate('/')}>
            ← Back to Generator
          </Button>
          <Button variant="secondary" onClick={() => navigate('/browse')}>
            📚 Browse Recipes
          </Button>
          <Button 
            variant="primary" 
            onClick={() => loadJobs(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            🚪 Logout
          </Button>
        </div>
      </div>

      {error && <StatusMessage type="error" message={error} />}

      {/* Jobs Table */}
      <JobsTable
        jobs={jobs}
        onView={handleViewRecipe}
        onCommit={handleCommit}
        onRetry={handleRetry}
        onDelete={handleDelete}
        onRefine={handleRefine}
        onStartReview={handleStartReview}
        onReturnToDrafts={handleReturnToDrafts}
        onViewError={handleViewError}
      />
    </div>
  );
};

