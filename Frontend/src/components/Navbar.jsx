import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CodeSquare, LogOut, UserCircle2, Settings, ChevronDown,
  ChevronRight, Code2, ChefHat, BarChart2, BookOpen, GitBranch, Activity, Trophy
} from 'lucide-react';
import { getUserEmail, clearSession } from '../utils/auth';

const PlatformDropdownItem = ({ platform, isActive, onClick }) => {
  const Icon = platform.icon;
  const isItemActive = isActive(platform.path);

  return (
    <Link
      to={platform.path}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 no-underline outline-none ${isItemActive ? 'bg-brand-50/60 shadow-sm ring-1 ring-brand-100/50' : 'hover:bg-gray-50/70'
        }`}
    >
      {isItemActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-brand-50/50 to-white/30 opacity-50 rounded-xl" />
      )}

      <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100/80 transition-transform duration-200 group-hover:scale-110 ${isItemActive ? 'ring-2 ring-brand-100/50' : ''}`}>
        <Icon size={16} className={`${platform.color} relative z-10`} />
      </div>

      <div className="flex flex-col flex-1 relative z-10">
        <span className={`text-sm font-semibold transition-colors ${isItemActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
          {platform.name}
        </span>
      </div>

      <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white transition-all duration-200 shadow-sm border border-gray-100 ${isItemActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
        }`}>
        <ChevronRight size={12} className="text-gray-400" />
      </div>
    </Link>
  );
};

const PlatformsDropdown = ({ isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const platforms = [
    { name: 'LeetCode', path: '/platforms/leetcode', icon: Code2, color: 'text-orange-500' },
    { name: 'Codeforces', path: '/platforms/codeforces', icon: Activity, color: 'text-blue-500' },
    { name: 'CodeChef', path: '/platforms/codechef', icon: ChefHat, color: 'text-amber-700' },
    { name: 'GeeksForGeeks', path: '/platforms/gfg', icon: BookOpen, color: 'text-green-600' },
    { name: 'GitHub', path: '/platforms/github', icon: GitBranch, color: 'text-slate-700' },
  ];

  const isAnyPlatformActive = platforms.some(p => isActive(p.path)) || isActive('/platforms');

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to="/platforms"
        className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors no-underline group outline-none rounded-lg ${isAnyPlatformActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
          }`}
        onClick={() => setIsOpen(false)}
      >
        Platforms
        <ChevronDown size={14} className={`transition-transform duration-200 text-gray-400 group-hover:text-gray-600 ${isOpen ? 'rotate-180' : ''}`} />
        {isAnyPlatformActive && (
          <motion.div
            layoutId="navbar-active"
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
            style={{ background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-[240px] rounded-2xl p-2 origin-top"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <div className="flex flex-col gap-1">
              {platforms.map((platform) => (
                <PlatformDropdownItem
                  key={platform.name}
                  platform={platform}
                  isActive={isActive}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Contests', path: '/contests' },
    { name: 'Schedule-Mail', path: '/schedule' },
    { name: 'Watch', path: '/watch' }
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(226,232,240,0.5)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 24px rgba(0,0,0,0.01)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 no-underline group relative outline-none w-[180px]">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500 blur-lg opacity-25 group-hover:opacity-45 transition-opacity duration-500 rounded-full"></div>
              <div 
                className="relative z-10 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                }}
              >
                <CodeSquare className="text-white" size={18} strokeWidth={2.5} />
              </div>
            </div>
            <span 
              className="text-[1.3rem] font-bold bg-clip-text text-transparent tracking-tight"
              style={{ 
                backgroundImage: 'linear-gradient(135deg, #1e1b4b, #4338ca)',
                fontFamily: '"Space Grotesk", "Inter", sans-serif',
              }}
            >
              DevFlow
            </span>
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center gap-0.5 justify-center flex-1">
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`relative px-4 py-2 text-sm font-medium transition-colors no-underline group outline-none rounded-lg ${isActive('/dashboard') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                Dashboard
                {isActive('/dashboard') && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                    style={{ background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>

              <PlatformsDropdown isActive={isActive} />

              {navLinks.slice(1).map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors no-underline group outline-none rounded-lg ${active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {link.name}
                    {active && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                        style={{ background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </>
          )}
        </div>

        <div className="flex items-center justify-end w-[180px]">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold relative group outline-none"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 2px 12px rgba(99,102,241,0.3), 0 0 0 3px rgba(255,255,255,0.8)',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                <span className="relative z-10 text-sm tracking-wide font-bold">{initial}</span>
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-3 w-60 rounded-2xl p-1.5 origin-top-right"
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid rgba(226,232,240,0.6)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}
                  >
                    <div className="px-3 py-2.5 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
                    </div>
                    <div className="h-px bg-gray-100/80 my-1 mx-2"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 rounded-xl transition-colors outline-none"
                    >
                      <UserCircle2 size={16} />
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 rounded-xl transition-colors outline-none"
                    >
                      <Settings size={16} />
                      Settings
                    </button>

                    <div className="h-px bg-gray-100/80 my-1 mx-2"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors outline-none"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold px-5 py-2 rounded-full text-white no-underline transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 2px 12px rgba(99,102,241,0.25)',
                }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
