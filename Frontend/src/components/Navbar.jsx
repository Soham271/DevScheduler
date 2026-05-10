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
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 no-underline outline-none ${isItemActive ? 'bg-gray-50/80 shadow-sm ring-1 ring-gray-100' : 'hover:bg-gray-50/50'
        }`}
    >
      {isItemActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-50 rounded-xl" />
      )}

      <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 transition-transform duration-200 group-hover:scale-110 ${isItemActive ? 'ring-2 ring-gray-100/50' : ''}`}>
        <Icon size={16} className={`${platform.color} relative z-10`} />
        <div className={`absolute inset-0 blur-md opacity-0 group-hover:opacity-20 transition-opacity rounded-lg ${platform.color.replace('text-', 'bg-')}`} />
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
        className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors no-underline group outline-none rounded-md ${isAnyPlatformActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
          }`}
        onClick={() => setIsOpen(false)}
      >
        Platforms
        <ChevronDown size={14} className={`transition-transform duration-200 text-gray-400 group-hover:text-gray-600 ${isOpen ? 'rotate-180' : ''}`} />
        {isAnyPlatformActive && (
          <motion.div
            layoutId="navbar-active"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <span className="absolute inset-0 rounded-md bg-gray-100/0 group-hover:bg-gray-100/50 transition-colors -z-10"></span>
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-[240px] rounded-2xl border border-gray-100/80 bg-white/85 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-2 origin-top"
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
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 no-underline group relative outline-none w-[160px]">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2.5"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-md opacity-30 group-hover:opacity-60 transition-opacity rounded-full"></div>
              <CodeSquare className="text-blue-600 relative z-10" size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[1.35rem] font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight" style={{ fontFamily: '"Space Grotesk", "Plus Jakarta Sans", sans-serif' }}>
              DevFlow
            </span>
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center gap-1 justify-center flex-1">
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`relative px-4 py-2 text-sm font-medium transition-colors no-underline group outline-none rounded-md ${isActive('/dashboard') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                Dashboard
                {isActive('/dashboard') && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="absolute inset-0 rounded-md bg-gray-100/0 group-hover:bg-gray-100/50 transition-colors -z-10"></span>
              </Link>

              <PlatformsDropdown isActive={isActive} />

              {navLinks.slice(1).map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors no-underline group outline-none rounded-md ${active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {link.name}
                    {active && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="absolute inset-0 rounded-md bg-gray-100/0 group-hover:bg-gray-100/50 transition-colors -z-10"></span>
                  </Link>
                )
              })}
            </>
          )}
        </div>

        <div className="flex items-center justify-end w-[160px]">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold shadow-sm ring-2 ring-white hover:shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-all relative group outline-none"
              >
                <span className="relative z-10 text-sm tracking-wide">{initial}</span>
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-56 rounded-xl border border-gray-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-1.5 origin-top-right"
                  >
                    <div className="px-3 py-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
                      <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors outline-none"
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors outline-none"
                    >
                      <Settings size={16} />
                      Settings
                    </button>

                    <div className="h-px bg-gray-100 my-1 mx-2"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors outline-none"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm no-underline"
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
