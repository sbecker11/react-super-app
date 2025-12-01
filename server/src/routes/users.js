const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { authenticate } = require('../middleware/auth');
const { requireOwnershipOrAdmin } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users
 * Get all users (admin only - can be enhanced later)
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/me
 * Get current authenticated user
 * NOTE: This must come before /:id route to avoid matching "me" as an ID
 */
router.get('/me', (req, res) => {
  // Return user with role
  res.json({ 
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.is_active,
      lastLoginAt: req.user.last_login_at,
      createdAt: req.user.created_at,
      updatedAt: req.user.updated_at
    }
  });
});

/**
 * GET /api/users/:id
 * Get user by ID
 * Users can view their own profile, admins can view any profile
 */
router.get('/:id', requireOwnershipOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists first
    const result = await query(
      'SELECT id, name, email, role, is_active, last_login_at, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PUT /api/users/:id
 * Update user (own profile only)
 */
router.put('/:id', requireOwnershipOrAdmin, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { name, email } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    // Build dynamic update query
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Add updated_by and id to values
    values.push(req.user.id);  // updated_by
    values.push(id);            // WHERE id = 
    
    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP, updated_by = $${paramCount}
       WHERE id = $${paramCount + 1}
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User updated successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (own profile only)
 * Note: Users can only delete their own accounts
 * Admins should use the deactivate endpoint instead
 */
router.delete('/:id', requireOwnershipOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;

