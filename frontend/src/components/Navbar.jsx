import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../pages/AuthContext.jsx'; // Corrected path
import Logo from './Logo.jsx'; // Import the new Logo component
import { usePanel } from '../pages/PanelContext.jsx';

const Navbar = () => {
  const { openPanel } = usePanel() || {}; // Gracefully handle if context is not available
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const location = useLocation();

  // Define the paths where the navbar should be hidden
  const hiddenPaths = ['/hr-interview', '/gd-room'];

  // Check if the current path starts with any of the hidden paths
  const isHidden = hiddenPaths.some(path => location.pathname.startsWith(path));

  // If the path matches, don't render the navbar
  if (isHidden) {
      return null;
  }

  const handlePanelOrScroll = (e, panelId, targetId) => {
    e.preventDefault();
    // If we are on the homepage and the panel context is available, open the panel
    if (location.pathname === '/' && openPanel) {
      openPanel(panelId);
    } else {
      // Otherwise, navigate to home and scroll to the section
      navigate('/');
      setTimeout(() => {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <nav className="hero-navbar-glass" id="main-navbar">
      <div className="navbar-content-wrapper">
        <Link to="/" className="navbar-logo-container">
          <Logo />
          <span>AI Mock Interview</span>
        </Link>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/analyze" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Resume Analyzer</NavLink>
          <a href="#features" onClick={(e) => handlePanelOrScroll(e, 'features', '#features-grid-section')} className="nav-link">Features</a>
          <a href="#about" onClick={(e) => handlePanelOrScroll(e, 'about', '#about-section')} className="nav-link">About</a>
          {currentUser ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
              <a href="#logout" className="nav-link" onClick={handleLogout}>Logout</a>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active login-link' : 'nav-link login-link'}>Login</NavLink>
              <NavLink to="/signup" className="nav-cta-button-gradient">Sign up free</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
