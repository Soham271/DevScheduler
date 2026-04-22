import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OnboardingModal from './components/OnboardingModal';
import { isLoggedIn, hasCompletedOnboarding, saveProfileLocally } from './utils/auth';
import './index.css';

const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      setIsAuthenticated(true);
      setNeedsOnboarding(!hasCompletedOnboarding());
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (profileData) => {
    if (profileData) saveProfileLocally(profileData);
    setNeedsOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading DevFlow...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
          <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup setIsAuthenticated={setIsAuthenticated} setNeedsOnboarding={setNeedsOnboarding} />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login setIsAuthenticated={setIsAuthenticated} setNeedsOnboarding={setNeedsOnboarding} />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {isAuthenticated && needsOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      </div>
    </Router>
  );
}

export default App;
