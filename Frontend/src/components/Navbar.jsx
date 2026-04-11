import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, CodeSquare } from 'lucide-react';
import { getUserEmail, clearSession } from '../utils/auth';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const email = getUserEmail();
  const initial = email ? email.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <CodeSquare className="logo-icon" size={22} />
          <span>DevFlow</span>
        </Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <div className="user-badge">
                <div className="user-avatar">{initial}</div>
                <span>{email || 'User'}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary nav-btn">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
