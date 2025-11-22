import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const AUTH_TOKEN_KEY = 'recipes_admin_token';

export const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Test authentication with health check (which doesn't require auth)
      // Then try an admin endpoint
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      // Store token in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, password);
      
      // Call onLogin callback if provided
      if (onLogin) {
        onLogin(password);
      }
      
      // Navigate to admin panel
      navigate('/admin');
    } catch (err) {
      setError('Authentication failed. Please check your password.');
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔒 Admin Login</h1>
        <p className="login-subtitle">Enter your password to access the admin panel</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
              disabled={loading}
              aria-label="Admin password"
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading || !password.trim()}
            aria-label="Submit login"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Export function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// Export function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

