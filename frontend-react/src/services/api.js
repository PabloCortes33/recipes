import axios from 'axios';
import { getAuthToken, clearAuthToken } from '../components/Auth/Login';

// Use relative URL in production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests for admin endpoints
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && (
      config.url?.includes('/api/generate-recipe') ||
      config.url?.includes('/api/job') ||
      config.url?.includes('/api/jobs') ||
      config.url?.includes('/api/git') ||
      config.url?.includes('/api/save-recipe')
    )) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401/403 responses (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuthToken();
      // Redirect to login if we're on an admin page
      if (window.location.pathname.startsWith('/admin') || 
          window.location.pathname.startsWith('/jobs')) {
        window.location.href = '/admin';
      }
    }
    return Promise.reject(error);
  }
);

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

