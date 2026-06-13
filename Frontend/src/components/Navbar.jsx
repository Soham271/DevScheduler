import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Code2,
  CodeSquare,
  GitBranch,
  LogOut,
  Settings,
  UserCircle2,
} from "lucide-react";
import { clearSession, getUserEmail } from "../utils/auth";

const PlatformDropdownItem = ({ platform, isActive, onClick }) => {
  const Icon = platform.icon;
  const active = isActive(platform.path);

  return (
    <Link
      to={platform.path}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-[16px] border px-3 py-3 no-underline transition ${
        active
          ? "border-[var(--color-charcoal)] bg-[var(--color-buttermilk)] text-[var(--color-charcoal)]"
          : "border-transparent bg-transparent text-[var(--color-cool-gray)] hover:border-[var(--color-ash-gray)] hover:bg-[var(--color-buttermilk)] hover:text-[var(--color-charcoal)]"
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-[14px] border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)]">
        <Icon size={16} className={platform.color} />
      </div>
      <span className="flex-1 text-sm font-medium">{platform.name}</span>
      <ChevronRight size={14} className="text-[var(--color-slate-blue)]" />
    </Link>
  );
};

const PlatformsDropdown = ({ isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const platforms = [
    { name: "LeetCode", path: "/platforms/leetcode", icon: Code2, color: "text-amber-500" },
    { name: "Codeforces", path: "/platforms/codeforces", icon: Activity, color: "text-slate-500" },
    { name: "CodeChef", path: "/platforms/codechef", icon: ChefHat, color: "text-rose-700" },
    { name: "GeeksForGeeks", path: "/platforms/gfg", icon: BookOpen, color: "text-emerald-600" },
    { name: "GitHub", path: "/platforms/github", icon: GitBranch, color: "text-slate-700" },
  ];

  const isAnyPlatformActive = platforms.some((p) => isActive(p.path)) || isActive("/platforms");

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Link
        to="/platforms"
        className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium no-underline transition ${
          isAnyPlatformActive
            ? "bg-[var(--color-canvas-white)] text-[var(--color-charcoal)] shadow-[var(--shadow-subtle-3)]"
            : "text-[var(--color-cool-gray)] hover:text-[var(--color-charcoal)]"
        }`}
        onClick={() => setIsOpen(false)}
      >
        Platforms
        <ChevronDown
          size={14}
          className={`text-[var(--color-slate-blue)] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 mt-3 w-[270px] -translate-x-1/2 rounded-[22px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.96)] p-2 shadow-[0_20px_40px_rgba(27,25,23,0.08)]"
          >
            <div className="mb-2 px-3 pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                Platforms
              </p>
            </div>
            <div className="space-y-1">
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
  const initial = email ? email.charAt(0).toUpperCase() : "?";
  const username = email ? email.split("@")[0] : "Developer";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Contests', path: '/contests' },
    { name: 'Hackathons', path: '/hackathons' },
    { name: 'Schedule-Mail', path: '/schedule' },
    { name: 'Watch', path: '/watch' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setMenuOpen(false);
    clearSession();
    setIsAuthenticated(false);
    navigate("/login");
  };

  useEffect(() => {
    const onOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="sticky top-0 z-50 border-b border-[rgba(27,25,23,0.08)] bg-[rgba(250,242,236,0.9)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] shadow-[var(--shadow-subtle-3)]">
            <CodeSquare className="text-[var(--color-charcoal)]" size={18} strokeWidth={2.4} />
          </div>
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-slate-blue)]">
              Developer workspace
            </span>
            <span
              className="block text-[1.35rem] leading-none text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              DevScheduler
            </span>
          </div>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          {isAuthenticated && (
            <div className="flex items-center gap-1 rounded-full border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.72)] p-1 shadow-[var(--shadow-subtle-3)]">
              <Link
                to="/dashboard"
                className={`rounded-full px-4 py-2 text-sm font-medium no-underline transition ${
                  isActive("/dashboard")
                    ? "bg-[var(--color-canvas-white)] text-[var(--color-charcoal)] shadow-[var(--shadow-subtle-3)]"
                    : "text-[var(--color-cool-gray)] hover:text-[var(--color-charcoal)]"
                }`}
              >
                Dashboard
              </Link>
              <PlatformsDropdown isActive={isActive} />
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`rounded-full px-4 py-2 text-sm font-medium no-underline transition ${
                    isActive(link.path)
                      ? "bg-[var(--color-canvas-white)] text-[var(--color-charcoal)] shadow-[var(--shadow-subtle-3)]"
                      : "text-[var(--color-cool-gray)] hover:text-[var(--color-charcoal)]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-sm font-semibold text-[var(--color-canvas-white)] shadow-[var(--shadow-subtle-3)]"
              >
                {initial}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-3 w-64 rounded-[22px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.98)] p-2 shadow-[0_20px_40px_rgba(27,25,23,0.08)]"
                  >
                    <div className="rounded-[18px] bg-[var(--color-buttermilk)] px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[var(--color-charcoal)]">
                        {username}
                      </p>
                      <p className="mt-1 truncate text-xs text-[var(--color-cool-gray)]">{email}</p>
                    </div>

                    <div className="mt-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/profile");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[16px] px-3 py-3 text-sm font-medium text-[var(--color-cool-gray)] transition hover:bg-[var(--color-buttermilk)] hover:text-[var(--color-charcoal)]"
                      >
                        <UserCircle2 size={16} />
                        Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/settings");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[16px] px-3 py-3 text-sm font-medium text-[var(--color-cool-gray)] transition hover:bg-[var(--color-buttermilk)] hover:text-[var(--color-charcoal)]"
                      >
                        <Settings size={16} />
                        Settings
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-[16px] px-3 py-3 text-sm font-medium text-[#be123c] transition hover:bg-[#fff1f2]"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-[var(--color-slate-blue)] no-underline transition hover:text-[var(--color-charcoal)]"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-[16px] border border-[var(--color-ink-black)] bg-[var(--color-canvas-white)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink-black)] no-underline shadow-[var(--shadow-subtle-3)] transition hover:bg-[var(--color-buttermilk)]"
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
