import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { processAuthResponse } from '../utils/auth';
import { UserPlus, Mail, Lock, CheckCircle } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import ActionButton from '../components/ActionButton';

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
    e.preventDefault(); setIsLoading(true); setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); setIsLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setIsLoading(false); return; }
    try {
      await api.post('/signup', { email, password }).catch(err => {
        if (err.message?.includes('404')) return api.post('/register', { email, password });
        throw err;
      });
      const loginResponse = await api.post('/login', { email, password });
      handleAuthSuccess({ ...loginResponse, is_new_user: true });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    if (password.length < 6) return { level: 1, text: 'Too short', color: 'bg-red-400' };
    if (password.length < 8) return { level: 2, text: 'Weak', color: 'bg-amber-400' };
    const score = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
    if (score >= 2 && password.length >= 10) return { level: 4, text: 'Strong', color: 'bg-emerald-500' };
    if (score >= 1) return { level: 3, text: 'Fair', color: 'bg-brand-400' };
    return { level: 2, text: 'Weak', color: 'bg-amber-400' };
  };
  const strength = getStrength();

  return (
    <div className="w-full max-w-md mx-auto mt-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-accent-400 to-brand-600" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shadow-inner">
            <UserPlus className="text-brand-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-gray-500 text-sm mt-1">Join DevFlow to track your coding journey</p>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center animate-fade-in">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
              <input type="email" id="signup-email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition placeholder:text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
              <input type="password" id="signup-password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength="6" autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition placeholder:text-gray-400" />
            </div>
            {password && (
              <div className="mt-2">
                <div className="h-1 rounded bg-gray-200 overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300 rounded`} style={{ width: `${strength.level * 25}%` }} />
                </div>
                <span className={`text-xs font-medium mt-1 block ${
                  strength.level <= 1 ? 'text-red-500' : strength.level <= 2 ? 'text-amber-500' : strength.level <= 3 ? 'text-brand-500' : 'text-emerald-600'
                }`}>{strength.text}</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
              <input type="password" id="signup-confirm" placeholder="••••••••" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition placeholder:text-gray-400" />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <span className="text-xs text-red-500 font-medium mt-1 block">Passwords don't match</span>
            )}
          </div>

          <ActionButton type="submit" disabled={isLoading} className="w-full [&_button]:w-full [&_button]:justify-center [&_button]:py-3">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </ActionButton>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <GoogleAuthButton onSuccess={handleAuthSuccess} onError={(err) => setError(err?.message || 'Google sign-up failed.')} text="signup_with" />

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-800">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
