import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on initial load
    const token = localStorage.getItem('token');
    if (token) {
      // Here you might optimally check token validity with a ping to the server
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="loading-screen" style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)' }}>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
            />
            <Route
              path="/signup"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
            />
            <Route
              path="/login"
              element={
                isAuthenticated ?
                  <Navigate to="/dashboard" replace /> :
                  <Login setIsAuthenticated={setIsAuthenticated} />
              }
            />
            <Route
              path="/setup-profile"
              element={
                <ProtectedRoute
                  element={<ProfileSetup />}
                  isAuthenticated={isAuthenticated}
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
