import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Visibility,
  CommitOutlined,
  Refresh,
  Delete,
  AutoAwesome,
  RateReview,
  ArrowBack,
  Error as ErrorIcon,
} from '@mui/icons-material';

export const JobsMobileView = ({
  jobs,
  onView,
  onCommit,
  onRetry,
  onDelete,
  onRefine,
  onStartReview,
  onReturnToDrafts,
  onViewError,
}) => {
  // Filter state - all categories visible by default
  const [visibleCategories, setVisibleCategories] = useState({
    pending: true,
    drafts: true,
    reviewing: true,
    failed: true,
  });

  const toggleCategory = (category) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
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

  const getStatusChip = (status) => {
    const statusMap = {
      pending: { label: 'In Progress', color: 'info' },
      researching: { label: 'Researching', color: 'info' },
      generating: { label: 'Generating', color: 'info' },
      formatting: { label: 'Formatting', color: 'info' },
      refining: { label: 'Refining', color: 'info' },
      completed: { label: 'Ready', color: 'success' },
      failed: { label: 'Failed', color: 'error' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'default' };
    return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />;
  };

  const getCategoryChip = (category) => {
    const categoryMap = {
      pending: { label: 'In Progress', color: '#3b82f6' },
      drafts: { label: 'Draft', color: '#22c55e' },
      reviewing: { label: 'Reviewing', color: '#a855f7' },
      failed: { label: 'Failed', color: '#ef4444' },
    };

    const categoryInfo = categoryMap[category] || { label: category, color: '#gray' };
    return (
      <Chip
        label={categoryInfo.label}
        size="small"
        sx={{
          backgroundColor: categoryInfo.color,
          color: 'white',
          fontWeight: 'bold',
        }}
      />
    );
  };

  const renderJobCard = (job, category) => {
    return (
      <Card key={job.jobId} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            {getCategoryChip(category)}
            {getStatusChip(job.status)}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            #{job.jobId}
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
            {job.recipes?.english?.filename || job.prompt}
          </Typography>

          {job.researchContext && (
            <Chip label="Research Used" size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
          )}

          <Typography variant="caption" color="text.secondary">
            {category === 'pending' && formatTimeAgo(job.createdAt)}
            {category === 'drafts' && `Completed ${formatTimeAgo(job.completedAt)}`}
            {category === 'reviewing' && `Completed ${formatTimeAgo(job.completedAt)}`}
            {category === 'failed' && `Failed ${formatTimeAgo(job.failedAt)}`}
          </Typography>
        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, p: 2, pt: 0 }}>
          {/* View button */}
          {(category === 'drafts' || category === 'reviewing') && (
            <IconButton size="small" color="primary" onClick={() => onView(job.jobId)}>
              <Visibility fontSize="small" />
            </IconButton>
          )}

          {/* Refine button */}
          {(category === 'drafts' || category === 'reviewing') && (
            <IconButton size="small" color="secondary" onClick={() => onRefine(job.jobId, 'Add refinement prompt here')}>
              <AutoAwesome fontSize="small" />
            </IconButton>
          )}

          {/* Start Review button */}
          {category === 'drafts' && (
            <IconButton size="small" color="secondary" onClick={() => onStartReview(job.jobId)}>
              <RateReview fontSize="small" />
            </IconButton>
          )}

          {/* Return to Drafts button */}
          {category === 'reviewing' && (
            <IconButton size="small" onClick={() => onReturnToDrafts(job.jobId)}>
              <ArrowBack fontSize="small" />
            </IconButton>
          )}

          {/* Commit button */}
          {(category === 'drafts' || category === 'reviewing') && (
            <IconButton size="small" color="success" onClick={() => onCommit(job.jobId)}>
              <CommitOutlined fontSize="small" />
            </IconButton>
          )}

          {/* View Error button */}
          {category === 'failed' && (
            <IconButton size="small" color="error" onClick={() => onViewError(job.jobId)}>
              <ErrorIcon fontSize="small" />
            </IconButton>
          )}

          {/* Retry button */}
          {category === 'failed' && (
            <IconButton size="small" color="primary" onClick={() => onRetry(job.jobId)}>
              <Refresh fontSize="small" />
            </IconButton>
          )}

          {/* Delete button */}
          {category !== 'pending' && (
            <IconButton size="small" color="error" onClick={() => onDelete(job.jobId)}>
              <Delete fontSize="small" />
            </IconButton>
          )}
        </CardActions>
      </Card>
    );
  };

  // Combine all jobs sorted by time
  const allJobs = [
    ...jobs.pending.map(job => ({ ...job, category: 'pending', timestamp: new Date(job.createdAt).getTime() })),
    ...jobs.drafts.map(job => ({ ...job, category: 'drafts', timestamp: new Date(job.completedAt).getTime() })),
    ...jobs.reviewing.map(job => ({ ...job, category: 'reviewing', timestamp: new Date(job.completedAt).getTime() })),
    ...jobs.failed.map(job => ({ ...job, category: 'failed', timestamp: new Date(job.failedAt).getTime() })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Filter jobs based on visible categories
  const filteredJobs = allJobs.filter((job) => visibleCategories[job.category]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Filter Chips - Toggle categories on/off */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label={`⏳ In Progress (${jobs.pending.length})`}
          onClick={() => toggleCategory('pending')}
          color={visibleCategories.pending ? 'info' : 'default'}
          variant={visibleCategories.pending ? 'filled' : 'outlined'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          label={`✅ Drafts (${jobs.drafts.length})`}
          onClick={() => toggleCategory('drafts')}
          color={visibleCategories.drafts ? 'success' : 'default'}
          variant={visibleCategories.drafts ? 'filled' : 'outlined'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          label={`🔍 Reviewing (${jobs.reviewing.length})`}
          onClick={() => toggleCategory('reviewing')}
          sx={{
            cursor: 'pointer',
            bgcolor: visibleCategories.reviewing ? '#a855f7' : 'transparent',
            color: visibleCategories.reviewing ? 'white' : 'text.secondary',
            borderColor: '#a855f7',
          }}
          variant={visibleCategories.reviewing ? 'filled' : 'outlined'}
          size="small"
        />
        <Chip
          label={`❌ Failed (${jobs.failed.length})`}
          onClick={() => toggleCategory('failed')}
          color={visibleCategories.failed ? 'error' : 'default'}
          variant={visibleCategories.failed ? 'filled' : 'outlined'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
      </Stack>

      {/* Continuous scrollable list of filtered jobs */}
      <Box>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => renderJobCard(job, job.category))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No jobs to display. Try adjusting filters.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
