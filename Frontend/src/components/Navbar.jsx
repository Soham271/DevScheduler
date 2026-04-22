import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CodeSquare } from 'lucide-react';
import { getUserEmail, clearSession } from '../utils/auth';
import LogoutButton from './LogoutButton';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = getUserEmail();
  const initial = email ? email.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <CodeSquare className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">DevFlow</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all no-underline ${isActive('/dashboard')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* User badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                  {initial}
                </div>
                <span className="text-sm text-gray-600 hidden sm:inline">{email || 'User'}</span>
              </div>

              <LogoutButton onClick={handleLogout} />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors no-underline ${isActive('/login') ? 'text-brand-700 bg-brand-50' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all no-underline"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
