import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Settings, User, Code2, Terminal } from 'lucide-react';

const ProfileSetup = () => {
  const [displayName, setDisplayName] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [codechefUsername, setCodechefUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Send profile data to backend
      await api.postAuth('/user/profile', {
        displayName,
        leetcodeUsername,
        codechefUsername
      });

      // Clear new user flag
      localStorage.removeItem('isNewUser');

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('isNewUser');
    navigate('/dashboard');
  };

  return (
    <div className="auth-container" style={{ maxWidth: '500px' }}>
      <div className="auth-card glass fade-in">
        <div className="auth-header">
          <div className="icon-wrapper primary-glow">
            <Settings className="auth-icon" />
          </div>
          <h2>Complete Your Profile</h2>
          <p>Link your coding platforms to get started</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSetup} className="auth-form">
          <div className="form-group">
            <label htmlFor="displayName">Display Name (Optional)</label>
            <div className="input-with-icon">
              <User className="input-icon" />
              <input
                type="text"
                id="displayName"
                placeholder="How should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="leetcodeUsername">LeetCode Username</label>
            <div className="input-with-icon">
              <Code2 className="input-icon" />
              <input
                type="text"
                id="leetcodeUsername"
                placeholder="e.g. neetcode"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="codechefUsername">CodeChef Username (Optional)</label>
            <div className="input-with-icon">
              <Terminal className="input-icon" />
              <input
                type="text"
                id="codechefUsername"
                placeholder="e.g. codechef_master"
                value={codechefUsername}
                onChange={(e) => setCodechefUsername(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for now
            </button>
            <button type="submit" className="btn-primary auth-submit" style={{ flex: 2, margin: 0 }} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
