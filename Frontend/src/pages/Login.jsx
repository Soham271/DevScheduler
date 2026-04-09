import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../services/api';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a state message from Signup
    if (location.state && location.state.message) {
      setInfoMsg(location.state.message);
      // Clear the state so it doesn't persist on reload
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleAuthSuccess = (response) => {
    // Store JWT token to localStorage
    if (response && response.token) {
      localStorage.setItem('token', response.token);
    } else if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    setIsAuthenticated(true);

    // Profile completion logic: Let's assume if it's their first time, backend sets needsProfileSetup: true
    // Or we just check locally if we haven't seen them before. 
    // We will conditionally route them to /setup-profile if a flag is passed, else /dashboard.
    if (response.needsProfileSetup || localStorage.getItem('isNewUser') === 'true') {
      navigate('/setup-profile');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfoMsg('');

    try {
      const response = await api.post('/login', { email, password });
      handleAuthSuccess(response);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');

    try {
      // Send Google JWT to backend
      const response = await api.post('/auth/google', { token: credentialResponse.credential });
      handleAuthSuccess(response);
    } catch (err) {
      setError(err.message || 'Google Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError('Google Login failed completely. Please try again.');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="icon-wrapper primary-glow">
            <LogIn className="auth-icon" />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your DevFlow account</p>
        </div>

        {infoMsg && <div className="auth-success" style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          color: '#60a5fa',
          padding: '0.75rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>{infoMsg}</div>}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Log In'}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
          <span style={{ padding: '0 10px', fontSize: '0.85rem' }}>OR</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
        </div>

        <div className="google-auth-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            theme="filled_black"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
