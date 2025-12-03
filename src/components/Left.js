import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate from react-router-dom
import { useAuth } from '../contexts/AuthContext';

function Left({ onHomeClick, onAboutClick, onLoginRegisterClick }) {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleDevPanel = () => {
    if (window.toggleDevPanel) {
      window.toggleDevPanel();
    }
  };

  // Only show dev tools in development
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === '';

  return (
    <div className="left">
      <ul>
        {/* Use Link components for navigation */}
        <li><Link to="/" onClick={onHomeClick}>Home</Link></li>
        <li><Link to="/about" onClick={onAboutClick}>About</Link></li>
        {!isAuthenticated && (
          <li><Link to="/login-register" onClick={onLoginRegisterClick}>Login/Register</Link></li>
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
            <li><Link to="/analyzer">Analyzer</Link></li>
            <li>
              <Link to="/profile">
                Profile {user?.name && <span style={{ fontStyle: 'italic' }}>{user.name}</span>}
              </Link>
            </li>
            {isAdmin() && (
              <li><Link to="/admin" style={{ fontWeight: 'bold' }}>⚙️ Admin</Link></li>
            )}
            <li>
              <button 
                onClick={() => {
                  // Navigate to home page first, then logout
                  // This prevents ProtectedRoute from redirecting to login-register
                  navigate('/', { replace: true });
                  logout();
                }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--link-color)', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  padding: 0,
                  width: '100%',
                  textAlign: 'left'
                }}
              >
Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}

export default Left;
