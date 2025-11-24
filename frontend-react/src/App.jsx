import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RecipeGenerator } from './components/RecipeGenerator/RecipeGenerator';
import { JobsDashboard } from './components/JobsDashboard/JobsDashboard';
import { RecipeBrowser } from './components/RecipeBrowser/RecipeBrowser';
import { RecipeViewer } from './components/RecipeViewer/RecipeViewer';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import './App.css';

function App() {
  // Determine if we're on the admin subdomain
  const isAdminDomain = window.location.hostname === 'dash.numves.com' || 
                        window.location.hostname === 'localhost';

  return (
    <BrowserRouter>
      <div className="app">
        {isAdminDomain ? (
          // Admin domain (dash.numves.com) - Admin routes only
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <RecipeGenerator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute>
                  <JobsDashboard />
                </ProtectedRoute>
              } 
            />
            {/* Keep browse and recipe viewer accessible from admin too */}
            <Route path="/browse" element={<RecipeBrowser />} />
            <Route path="/recipe/:path" element={<RecipeViewer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          // Public domain (numves.com) - Public routes only
          <Routes>
            <Route path="/" element={<RecipeBrowser />} />
            <Route path="/browse" element={<RecipeBrowser />} />
            <Route path="/recipe/:path" element={<RecipeViewer />} />
            {/* Redirect any admin attempts to dash subdomain */}
            <Route path="/admin" element={<Navigate to="https://dash.numves.com" replace />} />
            <Route path="/jobs" element={<Navigate to="https://dash.numves.com/jobs" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
