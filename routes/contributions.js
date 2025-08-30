const express = require('express');
const Contribution = require('../models/Contribution');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all contributions (Treasurer, Super Admin only)
router.get('/', authenticate, authorize(['treasurer', 'super_admin']), async (req, res) => {
  try {
    const contributions = await Contribution.getAll();
    res.json(contributions);
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contributions by user ID
router.get('/user/:userID', authenticate, async (req, res) => {
  try {
    const { userID } = req.params;
    
    // Members can only view their own contributions
    if (req.user.role === 'member' && req.user.id !== parseInt(userID)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const contributions = await Contribution.getByUserId(userID);
    res.json(contributions);
  } catch (error) {
    console.error('Get user contributions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new contribution
router.post('/', authenticate, authorize(['treasurer', 'super_admin']), async (req, res) => {
  try {
    const contributionId = await Contribution.create(req.body);
    res.status(201).json({ 
      message: 'Contribution created successfully', 
      contributionId 
    });
  } catch (error) {
    console.error('Create contribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contribution
router.put('/:id', authenticate, authorize(['treasurer', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await Contribution.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    res.json({ message: 'Contribution updated successfully' });
  } catch (error) {
    console.error('Update contribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contribution
router.delete('/:id', authenticate, authorize(['treasurer', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Contribution.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    res.json({ message: 'Contribution deleted successfully' });
  } catch (error) {
    console.error('Delete contribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;