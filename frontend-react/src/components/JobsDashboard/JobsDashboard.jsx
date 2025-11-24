import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobsTable } from './JobsTable';
import { JobsMobileView } from './JobsMobileView';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StatusMessage } from '../common/StatusMessage';
import { jobsAPI, recipeAPI } from '../../services/api';
import { clearAuthToken, getUsername } from '../Auth/Login';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Typography,
  Box,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import './JobsDashboard.css';

export const JobsDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Mobile if screen < 900px

  const [jobs, setJobs] = useState({ pending: [], drafts: [], reviewing: [], failed: [] });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [selectedError, setSelectedError] = useState(null);

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
      setSelectedError(job);
      setErrorDialogOpen(true);
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

      setSelectedRecipe(job);
      setRecipeDialogOpen(true);
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

      {/* Responsive View: Table for desktop, Cards for mobile */}
      {isMobile ? (
        <JobsMobileView
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
      ) : (
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
      )}

      {/* Recipe Preview Dialog */}
      <Dialog
        open={recipeDialogOpen}
        onClose={() => setRecipeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Recipe Preview
            {selectedRecipe && (
              <Chip label={`Job #${selectedRecipe.jobId}`} size="small" color="primary" />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRecipe && selectedRecipe.recipes && (
            <Box>
              {/* English Recipe */}
              {selectedRecipe.recipes.english && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      🇬🇧 English
                    </Typography>
                    <Chip
                      label={selectedRecipe.recipes.english.filename}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      maxHeight: 400,
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedRecipe.recipes.english.content}
                  </Box>
                </Box>
              )}

              {/* Divider */}
              {selectedRecipe.recipes.english && selectedRecipe.recipes.spanish && (
                <Divider sx={{ my: 3 }} />
              )}

              {/* Spanish Recipe */}
              {selectedRecipe.recipes.spanish && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      🇪🇸 Spanish
                    </Typography>
                    <Chip
                      label={selectedRecipe.recipes.spanish.filename}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      maxHeight: 400,
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedRecipe.recipes.spanish.content}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setRecipeDialogOpen(false)}>Close</MuiButton>
        </DialogActions>
      </Dialog>

      {/* Error Details Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Error Details
            {selectedError && (
              <Chip label={`Job #${selectedError.jobId}`} size="small" color="error" />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedError && (
            <Box>
              {/* Error Message */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Error Message
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }}
                >
                  {selectedError.error || 'No error message'}
                </Box>
              </Box>

              {/* Stderr */}
              {selectedError.errorStderr && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Standard Error (stderr)
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedError.errorStderr}
                  </Box>
                </Box>
              )}

              {/* Stdout */}
              {selectedError.errorStdout && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Standard Output (stdout)
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedError.errorStdout}
                  </Box>
                </Box>
              )}

              {/* Stack Trace */}
              {selectedError.errorStack && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Stack Trace
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.75rem',
                    }}
                  >
                    {selectedError.errorStack}
                  </Box>
                </Box>
              )}

              {/* Exit Code */}
              {selectedError.errorCode !== null && selectedError.errorCode !== undefined && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Exit Code
                  </Typography>
                  <Chip label={selectedError.errorCode} color="error" />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setErrorDialogOpen(false)}>Close</MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

