import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { processAuthResponse } from '../utils/auth';
import { UserPlus, Mail, Lock, CheckCircle } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Signup = ({ setIsAuthenticated, setNeedsOnboarding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = (response) => {
    const { needsOnboarding } = processAuthResponse(response);
    setIsAuthenticated(true);
    setNeedsOnboarding(needsOnboarding);
    navigate('/dashboard');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      // Try signup
      await api.post('/signup', { email, password }).catch(err => {
        if (err.message && err.message.includes('404')) {
          return api.post('/register', { email, password });
        }
        throw err;
      });

      // Auto-login after successful signup
      const loginResponse = await api.post('/login', { email, password });
      handleAuthSuccess({ ...loginResponse, is_new_user: true });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    setError(err?.message || 'Google sign-up failed. Please try again.');
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    if (password.length < 6) return { level: 1, text: 'Too short', color: 'var(--error)' };
    if (password.length < 8) return { level: 2, text: 'Weak', color: 'var(--warning)' };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score >= 2 && password.length >= 10) return { level: 4, text: 'Strong', color: 'var(--success)' };
    if (score >= 1) return { level: 3, text: 'Fair', color: 'var(--accent)' };
    return { level: 2, text: 'Weak', color: 'var(--warning)' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="icon-wrapper primary-glow">
            <UserPlus className="auth-icon" />
          </div>
          <h2>Create an Account</h2>
          <p>Join DevFlow to track your coding journey</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                type="email"
                id="signup-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input
                type="password"
                id="signup-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>
            {/* Password strength bar */}
            {password && (
              <div style={{ marginTop: '0.35rem' }}>
                <div style={{
                  height: '3px',
                  borderRadius: '2px',
                  background: 'var(--border)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${strength.level * 25}%`,
                    background: strength.color,
                    borderRadius: '2px',
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  color: strength.color,
                  fontWeight: 500,
                  marginTop: '0.15rem',
                  display: 'block'
                }}>
                  {strength.text}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <div className="input-with-icon">
              <CheckCircle className="input-icon" />
              <input
                type="password"
                id="signup-confirm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <span style={{ fontSize: '0.72rem', color: 'var(--error)', fontWeight: 500, marginTop: '0.1rem' }}>
                Passwords don't match
              </span>
            )}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <GoogleAuthButton 
          onSuccess={handleAuthSuccess}
          onError={handleGoogleError}
          text="signup_with"
        />

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Log in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
