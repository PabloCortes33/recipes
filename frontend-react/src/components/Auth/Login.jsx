import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const AUTH_TOKEN_KEY = 'recipes_admin_token';
const AUTH_USERNAME_KEY = 'recipes_admin_username';

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      
      // Call login endpoint to get JWT token
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid credentials');
      }

      const data = await response.json();

      // Store JWT token and username in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USERNAME_KEY, data.username);
      
      // Call onLogin callback if provided
      if (onLogin) {
        onLogin(data.token);
      }
      
      // Navigate to admin panel
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your username and password.');
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USERNAME_KEY);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔒 Admin Login</h1>
        <p className="login-subtitle">Enter your credentials to access the admin panel</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
              disabled={loading}
              aria-label="Username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={loading}
              aria-label="Password"
              autoComplete="current-password"
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
            disabled={loading || !username.trim() || !password.trim()}
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

// Export function to get username
export const getUsername = () => {
  return localStorage.getItem(AUTH_USERNAME_KEY);
};

// Export function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USERNAME_KEY);
};
