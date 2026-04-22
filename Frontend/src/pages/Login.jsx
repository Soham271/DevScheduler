import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { processAuthResponse } from '../utils/auth';
import { LogIn, Mail, Lock } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import ActionButton from '../components/ActionButton';

const Login = ({ setIsAuthenticated, setNeedsOnboarding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setInfoMsg(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleAuthSuccess = (response) => {
    const { needsOnboarding } = processAuthResponse(response);
    setIsAuthenticated(true);
    setNeedsOnboarding(needsOnboarding);
    navigate('/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setInfoMsg('');
    try {
      const response = await api.post('/login', { email, password });
      handleAuthSuccess(response);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-accent-400 to-brand-600" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shadow-inner">
            <LogIn className="text-brand-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to your DevFlow account</p>
        </div>

        {infoMsg && (
          <div className="mb-4 p-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-sm text-center animate-fade-in">
            {infoMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
              <input type="email" id="login-email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition placeholder:text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
              <input type="password" id="login-password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition placeholder:text-gray-400" />
            </div>
          </div>

          <ActionButton type="submit" disabled={isLoading} className="w-full [&_button]:w-full [&_button]:justify-center [&_button]:py-3">
            {isLoading ? 'Signing In...' : 'Log In'}
          </ActionButton>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <GoogleAuthButton onSuccess={handleAuthSuccess} onError={(err) => setError(err?.message || 'Google sign-in failed.')} text="signin_with" />

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/signup" className="text-brand-600 font-semibold hover:text-brand-800">Sign up here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
