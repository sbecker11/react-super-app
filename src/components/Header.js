import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { useAuth } from '../contexts/AuthContext';

function Header({ onHomeClick, onAboutClick, onLoginRegisterClick }) {
  const { isAuthenticated, isAdmin, user } = useAuth();

  const toggleDevPanel = () => {
    const panel = document.getElementById('dev-test-commands');
    if (panel) {
      const isVisible = panel.style.display === 'flex';
      panel.style.display = isVisible ? 'none' : 'flex';
    }
  };

  // Only show dev tools in development
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === '';

  return (
    <header>
      <div className="header-left">
        <img src="./logo192.png" alt="Logo" className="header-logo" />
      </div>
      <div className="header-right">
        <nav>
          <ul>
            {/* Use Link components for navigation */}
            <li><Link to="/" onClick={onHomeClick}>Home</Link></li>
            <li><Link to="/about" onClick={onAboutClick}>About</Link></li>
            {!isAuthenticated && (
              <li><Link to="/login-register" onClick={onLoginRegisterClick}>Login/Register</Link></li>
            )}
            {isDevelopment && (
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleDevPanel(); }} style={{ color: '#17a2b8' }}>
                  🧪 Dev Tools
                </a>
              </li>
            )}
            {isAuthenticated && (
              <>
                <li><Link to="/analyzer">Analyzer</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                {isAdmin() && (
                  <li><Link to="/admin" style={{ color: '#ffc107', fontWeight: 'bold' }}>Admin</Link></li>
                )}
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
