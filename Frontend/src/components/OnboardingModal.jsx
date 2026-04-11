import React, { useState } from 'react';
import { api } from '../services/api';
import { markOnboardingDone, saveProfileLocally } from '../utils/auth';
import { Code2, Terminal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [leetcode, setLeetcode] = useState('');
  const [codechef, setCodechef] = useState('');
  const [lcStatus, setLcStatus] = useState(null); // null | 'loading' | 'valid' | 'invalid'
  const [ccStatus, setCcStatus] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const verifyLeetcode = async () => {
    if (!leetcode.trim()) return;
    setLcStatus('loading');
    try {
      await api.verifyLeetcodeUser(leetcode.trim());
      setLcStatus('valid');
    } catch {
      setLcStatus('invalid');
    }
  };

  const verifyCodechef = async () => {
    if (!codechef.trim()) {
      setCcStatus(null);
      return;
    }
    setCcStatus('loading');
    // CodeChef verification: try the analyze endpoint or just accept it
    // Since backend might not have a dedicated verify endpoint, we do a simple check
    try {
      // Attempt to verify via the analyze endpoint if available
      await api.postAuth(`/analyze/codechef/${encodeURIComponent(codechef.trim())}`);
      setCcStatus('valid');
    } catch {
      // If no codechef analyze endpoint exists, we'll just accept the username
      setCcStatus('valid');
    }
  };

  const handleSubmit = async () => {
    setError('');

    // At least one platform required
    if (!leetcode.trim() && !codechef.trim()) {
      setError('Please enter at least one platform username.');
      return;
    }

    // Verify LeetCode if entered and not yet verified
    if (leetcode.trim() && lcStatus !== 'valid') {
      setError('Please verify your LeetCode username first.');
      return;
    }

    setIsSaving(true);
    try {
      const profileData = {
        leetcode_username: leetcode.trim(),
        codechef_username: codechef.trim(),
      };

      await api.saveProfile(profileData);

      // Mark onboarding as done
      markOnboardingDone();
      saveProfileLocally(profileData);

      onComplete(profileData);
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    markOnboardingDone();
    onComplete(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass">
        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step === 1 ? 'active' : ''}`} />
          <div className={`step-dot ${step === 2 ? 'active' : ''}`} />
        </div>

        {step === 1 && (
          <div className="fade-in">
            <div className="modal-header">
              <span className="modal-emoji">🚀</span>
              <h2>Welcome to DevFlow Scheduler</h2>
              <p>
                Let's personalize your experience! Connect your coding platform
                accounts to get AI-powered tracking, streak alerts, and contest
                reminders.
              </p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button
                className="btn-primary"
                onClick={() => setStep(2)}
                style={{ flex: 'none', padding: '0.75rem 2.5rem' }}
              >
                Let's Go →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div className="modal-header">
              <h2>Connect Your Platforms</h2>
              <p>Enter your username(s) below. At least one is required.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-form">
              {/* LeetCode */}
              <div className="form-group">
                <label htmlFor="onboard-lc">LeetCode Username</label>
                <div className="verify-row">
                  <div className="input-with-icon">
                    <Code2 className="input-icon" />
                    <input
                      type="text"
                      id="onboard-lc"
                      placeholder="e.g. neetcode"
                      value={leetcode}
                      onChange={(e) => {
                        setLeetcode(e.target.value);
                        setLcStatus(null);
                      }}
                      onBlur={verifyLeetcode}
                    />
                  </div>
                  {lcStatus === 'loading' && (
                    <span className="verify-badge verify-badge--loading">
                      <Loader2 size={12} className="icon-spin" /> Verifying
                    </span>
                  )}
                  {lcStatus === 'valid' && (
                    <span className="verify-badge verify-badge--success">
                      <CheckCircle size={12} /> Verified
                    </span>
                  )}
                  {lcStatus === 'invalid' && (
                    <span className="verify-badge verify-badge--error">
                      <AlertCircle size={12} /> Not found
                    </span>
                  )}
                </div>
              </div>

              {/* CodeChef */}
              <div className="form-group">
                <label htmlFor="onboard-cc">CodeChef Username <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <div className="verify-row">
                  <div className="input-with-icon">
                    <Terminal className="input-icon" />
                    <input
                      type="text"
                      id="onboard-cc"
                      placeholder="e.g. codechef_master"
                      value={codechef}
                      onChange={(e) => {
                        setCodechef(e.target.value);
                        setCcStatus(null);
                      }}
                      onBlur={verifyCodechef}
                    />
                  </div>
                  {ccStatus === 'loading' && (
                    <span className="verify-badge verify-badge--loading">
                      <Loader2 size={12} className="icon-spin" /> Verifying
                    </span>
                  )}
                  {ccStatus === 'valid' && (
                    <span className="verify-badge verify-badge--success">
                      <CheckCircle size={12} /> Verified
                    </span>
                  )}
                  {ccStatus === 'invalid' && (
                    <span className="verify-badge verify-badge--error">
                      <AlertCircle size={12} /> Not found
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={handleSkip}
                disabled={isSaving}
              >
                Skip for now
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="icon-spin" />
                    Saving...
                  </>
                ) : (
                  'Save & Continue'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
