import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RecipeGenerator } from './components/RecipeGenerator/RecipeGenerator';
import { JobsDashboard } from './components/JobsDashboard/JobsDashboard';
import { RecipeBrowser } from './components/RecipeBrowser/RecipeBrowser';
import { RecipeViewer } from './components/RecipeViewer/RecipeViewer';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<RecipeBrowser />} />
          <Route 
            path="/admin" 
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
          <Route path="/recipe/:path" element={<RecipeViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
