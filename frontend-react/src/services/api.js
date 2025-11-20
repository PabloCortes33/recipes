import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Recipe generation API
export const recipeAPI = {
  generate: (prompt, mode = 'create') => 
    api.post('/api/generate-recipe', { prompt, mode }),
  
  refine: (jobId, refinementPrompt) => 
    api.post(`/api/job/${jobId}/refine`, { refinementPrompt }),
  
  commit: (jobId, commitMessage) => 
    api.post(`/api/job/${jobId}/commit`, { commitMessage }),
  
  save: (recipes, commitMessage) => 
    api.post('/api/save-recipe', { recipes, commitMessage }),
};

// Jobs API
export const jobsAPI = {
  list: () => api.get('/api/jobs'),
  
  get: (jobId) => api.get(`/api/job/${jobId}`),
  
  delete: (jobId) => api.delete(`/api/job/${jobId}`),
  
  retry: (jobId) => api.post(`/api/job/${jobId}/retry`),
  
  cancel: (jobId) => api.post(`/api/job/${jobId}/cancel`),
};

// Git API
export const gitAPI = {
  push: () => api.post('/api/git/push'),
  
  pull: () => api.post('/api/git/pull'),
  
  status: () => api.get('/api/git/status'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/api/health'),
};

// Recipes API (for recipe browser)
export const recipesAPI = {
  getManifest: () => api.get('/api/recipes/manifest'),
  
  getRecipe: (recipePath) => api.get(`/api/recipes/file/${recipePath}`, {
    responseType: 'text',
  }),
};

export default api;

