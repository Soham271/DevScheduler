import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OnboardingModal from './components/OnboardingModal';
import { isLoggedIn, hasCompletedOnboarding, saveProfileLocally } from './utils/auth';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth state on initial load
    if (isLoggedIn()) {
      setIsAuthenticated(true);
      setNeedsOnboarding(!hasCompletedOnboarding());
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (profileData) => {
    if (profileData) {
      saveProfileLocally(profileData);
    }
    setNeedsOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading DevFlow...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
            />
            <Route
              path="/signup"
              element={
                isAuthenticated ?
                  <Navigate to="/dashboard" replace /> :
                  <Signup
                    setIsAuthenticated={setIsAuthenticated}
                    setNeedsOnboarding={setNeedsOnboarding}
                  />
              }
            />
            <Route
              path="/login"
              element={
                isAuthenticated ?
                  <Navigate to="/dashboard" replace /> :
                  <Login
                    setIsAuthenticated={setIsAuthenticated}
                    setNeedsOnboarding={setNeedsOnboarding}
                  />
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  element={<Dashboard />}
                  isAuthenticated={isAuthenticated}
                />
              }
            />
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Onboarding modal overlay (renders on top of dashboard) */}
        {isAuthenticated && needsOnboarding && (
          <OnboardingModal onComplete={handleOnboardingComplete} />
        )}
      </div>
    </Router>
  );
}

export default App;
