/**
 * Admin Authentication Modal
 * 
 * Prompts admin to re-enter password for elevated session
 * Used before sensitive operations like changing roles or resetting passwords
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AdminAuthModal.css';

const AdminAuthModal = ({ isOpen, onClose, onSuccess, title = 'Admin Authentication Required' }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { requestElevatedSession } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await requestElevatedSession(password);
      if (success) {
        setPassword('');
        onSuccess();
        onClose();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="admin-auth-modal-overlay" onClick={handleClose}>
      <div className="admin-auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-auth-modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="admin-auth-modal-body">
          <p className="admin-auth-message">
            This action requires elevated privileges. Please enter your admin password to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="admin-auth-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !password}
              >
                {loading ? 'Verifying...' : 'Authenticate'}
              </button>
            </div>
          </form>

          <p className="admin-auth-note">
            <strong>Note:</strong> Elevated session will expire after 15 minutes of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthModal;

