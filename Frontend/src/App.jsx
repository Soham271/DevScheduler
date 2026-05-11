import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Contests from './pages/Contests';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Watch from './pages/Watch';
import LeetCodePage from './pages/LeetCodePage';
import CodeforcesPage from './pages/CodeforcesPage';
import CodeChefPage from './pages/CodeChefPage';
import GFGPage from './pages/GFGPage';
import GitHubPage from './pages/GitHubPage';
import OnboardingModal from './components/OnboardingModal';
import { isLoggedIn, hasCompletedOnboarding, saveProfileLocally } from './utils/auth';
import './index.css';

const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

/** Wrapper that conditionally shows the Navbar and main padding */
const AppLayout = ({ isAuthenticated, setIsAuthenticated, setNeedsOnboarding, needsOnboarding, handleOnboardingComplete }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/' && !isAuthenticated;

  // Landing page now inherits the default light theme

  return (
    <div className="min-h-screen">
      {/* Hide navbar on the immersive landing page */}
      {!isLanding && (
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      )}
      <main className={isLanding ? '' : 'px-4 sm:px-6 lg:px-8 py-6 flex justify-center'}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage
                  setIsAuthenticated={setIsAuthenticated}
                  setNeedsOnboarding={setNeedsOnboarding}
                />
              )
            }
          />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup setIsAuthenticated={setIsAuthenticated} setNeedsOnboarding={setNeedsOnboarding} />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login setIsAuthenticated={setIsAuthenticated} setNeedsOnboarding={setNeedsOnboarding} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />} />
          <Route path="/contests" element={<ProtectedRoute element={<Contests />} isAuthenticated={isAuthenticated} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} isAuthenticated={isAuthenticated} />} />
          <Route path="/schedule" element={<ProtectedRoute element={<Schedule />} isAuthenticated={isAuthenticated} />} />
          <Route path="/watch" element={<ProtectedRoute element={<Watch />} isAuthenticated={isAuthenticated} />} />
          <Route path="/platforms/leetcode" element={<ProtectedRoute element={<LeetCodePage />} isAuthenticated={isAuthenticated} />} />
          <Route path="/platforms/codeforces" element={<ProtectedRoute element={<CodeforcesPage />} isAuthenticated={isAuthenticated} />} />
          <Route path="/platforms/codechef" element={<ProtectedRoute element={<CodeChefPage />} isAuthenticated={isAuthenticated} />} />
          <Route path="/platforms/gfg" element={<ProtectedRoute element={<GFGPage />} isAuthenticated={isAuthenticated} />} />
          <Route path="/platforms/github" element={<ProtectedRoute element={<GitHubPage />} isAuthenticated={isAuthenticated} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isAuthenticated && needsOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
    </div>
  );
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
      <AppLayout
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        setNeedsOnboarding={setNeedsOnboarding}
        needsOnboarding={needsOnboarding}
        handleOnboardingComplete={handleOnboardingComplete}
      />
    </Router>
  );
}

export default App;
