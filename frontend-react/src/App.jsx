import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RecipeGenerator } from './components/RecipeGenerator/RecipeGenerator';
import { JobsDashboard } from './components/JobsDashboard/JobsDashboard';
import { RecipeBrowser } from './components/RecipeBrowser/RecipeBrowser';
import { RecipeViewer } from './components/RecipeViewer/RecipeViewer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<RecipeGenerator />} />
          <Route path="/admin" element={<RecipeGenerator />} />
          <Route path="/jobs" element={<JobsDashboard />} />
          <Route path="/browse" element={<RecipeBrowser />} />
          <Route path="/recipe/:path" element={<RecipeViewer />} />
          <Route path="*" element={<Navigate to="/browse" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
