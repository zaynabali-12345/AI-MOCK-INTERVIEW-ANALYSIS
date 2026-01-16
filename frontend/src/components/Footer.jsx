import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="footer-container">
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-about">
            <div className="navbar-logo-container">
              <div className="glass-logo">
                <div className="glass-logo-inner"></div>
              </div>
              <span>AI Mock Interview</span>
            </div>
            <p>An intelligent platform to practice interviews, analyze resumes, and receive personalized feedback.</p>
          </div>
          <div className="footer-links-wrapper">
            <div className="footer-links-column">
              <h4>Main Page</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><a href="#features-grid-section">Features</a></li>
                <li><a href="#about-section">About</a></li>
              </ul>
            </div>
            <div className="footer-links-column">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div className="footer-links-column">
              <h4>Others</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">&copy; {new Date().getFullYear()} AI Mock Interview. All Rights Reserved.</p>
          <div className="social-icons">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">X</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">G</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
