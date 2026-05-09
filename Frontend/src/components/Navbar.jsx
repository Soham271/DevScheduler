import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CodeSquare, ChevronDown, LogOut, UserCircle2, Trophy, Calendar, Eye } from 'lucide-react';
import { getUserEmail, clearSession } from '../utils/auth';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = getUserEmail();
  const initial = email ? email.charAt(0).toUpperCase() : '?';
  const username = email ? email.split('@')[0] : 'Developer';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    setMenuOpen(false);
    clearSession();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const onOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onOutsideClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutsideClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_10px_22px_rgba(59,130,246,0.38)] group-hover:scale-105 transition-transform">
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
            <CodeSquare className="text-white" size={18} />
          </div>
          <span className="text-[2rem] leading-none text-slate-900 tracking-[-0.02em] font-black" style={{ fontFamily: '"Space Grotesk", "Plus Jakarta Sans", sans-serif' }}>
            DevFlow
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3 min-w-0">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline border ${isActive('/dashboard')
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
                  : 'text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                to="/contests"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline border ${isActive('/contests')
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
                  : 'text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <Trophy size={16} />
                <span className="hidden sm:inline">Contests</span>
              </Link>
              <Link
                to="/schedule"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline border ${isActive('/schedule')
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
                  : 'text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <Calendar size={16} />
                <span className="hidden sm:inline">Schedule</span>
              </Link>
              <Link
                to="/watch"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline border ${isActive('/watch')
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
                  : 'text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <Eye size={16} />
                <span className="hidden sm:inline">Watch</span>
              </Link>

              {/* Avatar menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="group flex items-center gap-2 rounded-full border border-slate-200/90 bg-white pl-1.5 pr-3 py-1.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {initial}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-slate-700 max-w-[220px] truncate">{email || 'Developer'}</span>
                  <ChevronDown size={16} className={`text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] p-2 transition-all origin-top-right ${menuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Signed in as</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{username}</p>
                    <p className="text-xs text-slate-500 truncate">{email || 'No email'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full mt-2 flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <UserCircle2 size={16} />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
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
