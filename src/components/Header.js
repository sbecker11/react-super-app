import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation from react-router-dom
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Header({ onHomeClick, onAboutClick, onLoginRegisterClick }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleDevPanel = () => {
    if (window.toggleDevPanel) {
      window.toggleDevPanel();
    }
  };

  // Only show dev tools in development
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === '';

  // Determine active route
  const isHomeActive = location.pathname === '/' || location.pathname === '/home';
  const isAboutActive = location.pathname === '/about';
  const isLoginRegisterActive = location.pathname === '/login-register';
  const isAnalyzerActive = location.pathname === '/analyzer';
  const isProfileActive = location.pathname === '/profile';
  const isAdminActive = location.pathname.startsWith('/admin');

  // Use theme-aware logo: dark logo for light mode, light logo for dark mode
  const logoSrc = theme === 'light' ? './logo192-dark.png' : './logo192.png';

  return (
    <header>
      <div className="header-left">
        <img src={logoSrc} alt="Logo" className="header-logo" />
      </div>
      <div className="header-right">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <span className="moon-icon">🌙</span> : '☀️'}
        </button>
        <nav>
          <ul>
            {/* Use Link components for navigation */}
            <li>
              <Link 
                to="/" 
                onClick={onHomeClick}
                className={isHomeActive ? 'active' : ''}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                onClick={onAboutClick}
                className={isAboutActive ? 'active' : ''}
              >
                About
              </Link>
            </li>
            {!isAuthenticated && (
              <li>
                <Link 
                  to="/login-register" 
                  onClick={onLoginRegisterClick}
                  className={isLoginRegisterActive ? 'active' : ''}
                >
                  Login/Register
                </Link>
              </li>
            )}
            {isDevelopment && (
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleDevPanel(); }}>
                  Dev Tools
                </a>
              </li>
            )}
            {isAuthenticated && (
              <>
                <li>
                  <Link 
                    to="/analyzer"
                    className={isAnalyzerActive ? 'active' : ''}
                  >
                    Analyzer
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile"
                    className={isProfileActive ? 'active' : ''}
                  >
                    Profile
                  </Link>
                </li>
                {isAdmin() && (
                  <li>
                    <Link 
                      to="/admin" 
                      className={isAdminActive ? 'active' : ''}
                      style={{ fontWeight: 'bold' }}
                    >
                      Admin
                    </Link>
                  </li>
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
