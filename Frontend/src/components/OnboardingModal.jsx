import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { processAuthResponse } from '../utils/auth';
import { Code2, Terminal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { markOnboardingDone, saveProfileLocally } from '../utils/auth';
import ActionButton from './ActionButton';

const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [leetcode, setLeetcode] = useState('');
  const [codechef, setCodechef] = useState('');
  const [github, setGithub] = useState('');
  const [lcStatus, setLcStatus] = useState(null);
  const [ccStatus, setCcStatus] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const verifyLeetcode = async () => {
    if (!leetcode.trim()) return;
    setLcStatus('loading');
    try { await api.verifyLeetcodeUser(leetcode.trim()); setLcStatus('valid'); } catch { setLcStatus('invalid'); }
  };

  const verifyCodechef = async () => {
    if (!codechef.trim()) { setCcStatus(null); return; }
    setCcStatus('loading');
    try { await api.postAuth(`/analyze/codechef/${encodeURIComponent(codechef.trim())}`); setCcStatus('valid'); } catch { setCcStatus('valid'); }
  };

  const handleSubmit = async () => {
    setError('');
    if (!leetcode.trim() && !codechef.trim() && !github.trim()) { setError('Please enter at least one platform username.'); return; }
    if (leetcode.trim() && lcStatus !== 'valid') { setError('Please verify your LeetCode username first.'); return; }
    setIsSaving(true);
    try {
      const profileData = { 
        leetcode_username: leetcode.trim(), 
        codechef_username: codechef.trim(),
        github_username: github.trim()
      };
      await api.saveProfile(profileData);
      markOnboardingDone();
      saveProfileLocally(profileData);
      onComplete(profileData);
    } catch (err) { setError(err.message || 'Failed to save profile.'); }
    finally { setIsSaving(false); }
  };

  const handleSkip = () => { markOnboardingDone(); onComplete(null); };

  const Badge = ({ status }) => {
    if (status === 'loading') return <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-charcoal)] bg-[var(--color-ash-gray)] px-2 py-0.5 rounded-full"><Loader2 size={12} className="icon-spin" /> Verifying</span>;
    if (status === 'valid') return <span className="flex items-center gap-1 text-xs font-medium text-[#059669] bg-[#10b981]/10 px-2 py-0.5 rounded-full"><CheckCircle size={12} /> Verified</span>;
    if (status === 'invalid') return <span className="flex items-center gap-1 text-xs font-medium text-[#be123c] bg-[#fda4af]/30 px-2 py-0.5 rounded-full"><AlertCircle size={12} /> Not found</span>;
    return null;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--color-buttermilk)]/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-lg bg-[var(--color-canvas-white)] rounded-[20px] shadow-[var(--shadow-subtle)] p-8 relative overflow-hidden animate-scale-in border border-[var(--color-ash-gray)]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-slate-blue)]" />

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6">
          <div className={`h-2 rounded-full transition-all ${step === 1 ? 'w-6 bg-[var(--color-charcoal)]' : 'w-2 bg-[var(--color-ash-gray)]'}`} />
          <div className={`h-2 rounded-full transition-all ${step === 2 ? 'w-6 bg-[var(--color-charcoal)]' : 'w-2 bg-[var(--color-ash-gray)]'}`} />
        </div>

        {step === 1 && (
          <div className="text-center animate-fade-in">
            <span className="text-5xl block mb-4" style={{ animation: 'float 3s ease-in-out infinite' }}>🚀</span>
            <h2 className="text-2xl font-bold text-[var(--color-charcoal)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Welcome to DevFlow Scheduler</h2>
            <p className="text-[var(--color-cool-gray)] text-sm leading-relaxed mb-6">Let's personalize your experience! Connect your coding platform accounts to get AI-powered tracking, streak alerts, and contest reminders.</p>
            <ActionButton onClick={() => setStep(2)} className="mx-auto [&_button]:px-8 [&_button]:py-3">
              Let's Go →
            </ActionButton>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-charcoal)]">Connect Your Platforms</h2>
              <p className="text-[var(--color-cool-gray)] text-sm mt-1">Enter your username(s) below. At least one is required.</p>
            </div>

            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>}

            <div className="space-y-4">
              <div>
                <label htmlFor="onboard-lc" className="block text-sm font-medium text-[var(--color-slate-blue)] mb-1.5 uppercase tracking-wide">LeetCode Username</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cool-gray)] pointer-events-none" size={17} />
                    <input type="text" id="onboard-lc" placeholder="e.g. neetcode" value={leetcode}
                      onChange={(e) => { setLeetcode(e.target.value); setLcStatus(null); }} onBlur={verifyLeetcode}
                      className="w-full pl-10 pr-4 py-3 rounded-none border border-[var(--color-charcoal)] bg-transparent text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-field-green)] focus:border-[var(--color-field-green)] transition placeholder:text-[var(--color-cool-gray)]" />
                  </div>
                  <Badge status={lcStatus} />
                </div>
              </div>

              <div>
                <label htmlFor="onboard-cc" className="block text-sm font-medium text-[var(--color-slate-blue)] mb-1.5 uppercase tracking-wide">CodeChef Username <span className="text-[var(--color-cool-gray)] font-normal normal-case">(optional)</span></label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cool-gray)] pointer-events-none" size={17} />
                    <input type="text" id="onboard-cc" placeholder="e.g. codechef_master" value={codechef}
                      onChange={(e) => { setCodechef(e.target.value); setCcStatus(null); }} onBlur={verifyCodechef}
                      className="w-full pl-10 pr-4 py-3 rounded-none border border-[var(--color-charcoal)] bg-transparent text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-field-green)] focus:border-[var(--color-field-green)] transition placeholder:text-[var(--color-cool-gray)]" />
                  </div>
                  <Badge status={ccStatus} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSkip} disabled={isSaving}
                className="flex-1 py-3 rounded-[16px] border border-[var(--color-charcoal)] bg-transparent text-[var(--color-charcoal)] font-medium text-sm hover:bg-[var(--color-buttermilk)] transition disabled:opacity-50">
                Skip for now
              </button>
              <ActionButton onClick={handleSubmit} disabled={isSaving} className="flex-[2] [&_button]:w-full [&_button]:justify-center [&_button]:py-3">
                {isSaving ? <><Loader2 size={16} className="icon-spin" /> Saving...</> : 'Save & Continue'}
              </ActionButton>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-slate-blue)] mb-1.5 uppercase tracking-wide mt-4">GitHub Username (Optional)</label>
              <input
                type="text"
                placeholder="e.g. torvalds"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full px-4 py-3 rounded-none border border-[var(--color-charcoal)] bg-transparent text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-field-green)] focus:border-[var(--color-field-green)] transition placeholder:text-[var(--color-cool-gray)]"
              />
              <p className="mt-1.5 text-xs text-[var(--color-cool-gray)]">Used for real-time dev pulse tracking.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
