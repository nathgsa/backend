const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (Super Admin only)
router.get('/', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const users = await User.getAll();
    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users by role
router.get('/role/:role', authenticate, authorize(['super_admin', 'treasurer', 'screening_committee']), async (req, res) => {
  try {
    const { role } = req.params;
    
    const validRoles = ['member', 'super_admin', 'treasurer', 'screening_committee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const users = await User.getByRole(role);
    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin/treasurer/committee
    if (req.user.role === 'member' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only update their own profile unless they're super admin
    if (req.user.role !== 'super_admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await User.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Super Admin only)
router.delete('/:id', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await User.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;