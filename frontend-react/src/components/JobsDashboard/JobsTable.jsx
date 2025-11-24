import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Paper
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

export const JobsTable = ({
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
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [commitJobId, setCommitJobId] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [refineDialogOpen, setRefineDialogOpen] = useState(false);
  const [refineJobId, setRefineJobId] = useState(null);
  const [refinementPrompt, setRefinementPrompt] = useState('');

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
          fontWeight: 'bold'
        }}
      />
    );
  };

  const handleCommitClick = (jobId) => {
    setCommitJobId(jobId);
    setCommitMessage('Add recipe');
    setCommitDialogOpen(true);
  };

  const handleCommitSubmit = () => {
    if (commitJobId && commitMessage) {
      onCommit(commitJobId, commitMessage);
      setCommitDialogOpen(false);
      setCommitJobId(null);
      setCommitMessage('');
    }
  };

  const handleRefineClick = (jobId) => {
    setRefineJobId(jobId);
    setRefinementPrompt('');
    setRefineDialogOpen(true);
  };

  const handleRefineSubmit = () => {
    if (refineJobId && refinementPrompt.trim()) {
      onRefine(refineJobId, refinementPrompt);
      setRefineDialogOpen(false);
      setRefineJobId(null);
      setRefinementPrompt('');
    }
  };

  const columns = [
    {
      field: 'category',
      headerName: 'State',
      width: 120,
      renderCell: (params) => getCategoryChip(params.value),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'jobId',
      headerName: 'Job ID',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'recipe',
      headerName: 'Recipe',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          {params.row.hasResearch && (
            <Chip label="Research Used" size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
          )}
        </Box>
      ),
    },
    {
      field: 'time',
      headerName: 'Time',
      width: 100,
      valueGetter: (value, row) => row.timestamp, // Use timestamp for sorting
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.timeDisplay}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      sortable: false,
      renderCell: (params) => {
        const job = params.row;

        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* View button - always available for completed/reviewing jobs */}
            {(job.category === 'drafts' || job.category === 'reviewing') && (
              <Tooltip title="View Recipe">
                <IconButton size="small" color="primary" onClick={() => onView(job.jobId)}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Refine button - for drafts and reviewing */}
            {(job.category === 'drafts' || job.category === 'reviewing') && (
              <Tooltip title="Refine Recipe">
                <IconButton size="small" color="secondary" onClick={() => handleRefineClick(job.jobId)}>
                  <AutoAwesome fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Start Review button - only for drafts */}
            {job.category === 'drafts' && (
              <Tooltip title="Start Review">
                <IconButton size="small" color="secondary" onClick={() => onStartReview(job.jobId)}>
                  <RateReview fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Return to Drafts button - only for reviewing */}
            {job.category === 'reviewing' && (
              <Tooltip title="Return to Drafts">
                <IconButton size="small" color="default" onClick={() => onReturnToDrafts(job.jobId)}>
                  <ArrowBack fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Commit button - for drafts and reviewing */}
            {(job.category === 'drafts' || job.category === 'reviewing') && (
              <Tooltip title="Commit & Push">
                <IconButton size="small" color="success" onClick={() => handleCommitClick(job.jobId)}>
                  <CommitOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* View Error button - only for failed */}
            {job.category === 'failed' && (
              <Tooltip title="View Error">
                <IconButton size="small" color="error" onClick={() => onViewError(job.jobId)}>
                  <ErrorIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Retry button - only for failed */}
            {job.category === 'failed' && (
              <Tooltip title="Retry">
                <IconButton size="small" color="primary" onClick={() => onRetry(job.jobId)}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Delete button - always available except for pending */}
            {job.category !== 'pending' && (
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => onDelete(job.jobId)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  // Flatten jobs into rows
  const rows = [
    ...jobs.pending.map((job) => ({
      id: job.jobId,
      category: 'pending',
      status: job.status,
      jobId: job.jobId,
      recipe: job.recipes?.english?.filename || job.prompt,
      hasResearch: !!job.researchContext,
      timestamp: new Date(job.createdAt).getTime(),
      timeDisplay: formatTimeAgo(job.createdAt),
      error: job.error,
    })),
    ...jobs.drafts.map((job) => ({
      id: job.jobId,
      category: 'drafts',
      status: job.status,
      jobId: job.jobId,
      recipe: job.recipes?.english?.filename || job.prompt,
      hasResearch: !!job.researchContext,
      timestamp: new Date(job.completedAt).getTime(),
      timeDisplay: formatTimeAgo(job.completedAt),
      error: job.error,
    })),
    ...jobs.reviewing.map((job) => ({
      id: job.jobId,
      category: 'reviewing',
      status: job.status,
      jobId: job.jobId,
      recipe: job.recipes?.english?.filename || job.prompt,
      hasResearch: !!job.researchContext,
      timestamp: new Date(job.completedAt).getTime(),
      timeDisplay: formatTimeAgo(job.completedAt),
      error: job.error,
    })),
    ...jobs.failed.map((job) => ({
      id: job.jobId,
      category: 'failed',
      status: job.status,
      jobId: job.jobId,
      recipe: job.recipes?.english?.filename || job.prompt,
      hasResearch: !!job.researchContext,
      timestamp: new Date(job.failedAt).getTime(),
      timeDisplay: formatTimeAgo(job.failedAt),
      error: job.error,
    })),
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
            sorting: {
              sortModel: [{ field: 'time', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
            },
          }}
        />
      </Paper>

      {/* Commit Dialog */}
      <Dialog open={commitDialogOpen} onClose={() => setCommitDialogOpen(false)}>
        <DialogTitle>Commit Recipe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Commit Message"
            fullWidth
            variant="outlined"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommitDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCommitSubmit} variant="contained" color="primary">
            Commit & Push
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refine Dialog */}
      <Dialog open={refineDialogOpen} onClose={() => setRefineDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Refine Recipe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Refinement Instructions"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={refinementPrompt}
            onChange={(e) => setRefinementPrompt(e.target.value)}
            placeholder="E.g., Make it spicier, add more vegetables, adjust cooking time..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefineDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRefineSubmit} variant="contained" color="secondary">
            Refine Recipe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
