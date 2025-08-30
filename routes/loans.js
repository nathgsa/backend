const express = require('express');
const Loan = require('../models/Loan');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all loans
router.get('/', authenticate, authorize(['treasurer', 'super_admin', 'screening_committee']), async (req, res) => {
  try {
    const loans = await Loan.getAll();
    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get loans by user ID
router.get('/user/:userID', authenticate, async (req, res) => {
  try {
    const { userID } = req.params;
    
    // Members can only view their own loans
    if (req.user.role === 'member' && req.user.id !== parseInt(userID)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const loans = await Loan.getByUserId(userID);
    res.json(loans);
  } catch (error) {
    console.error('Get user loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new loan
router.post('/', authenticate, authorize(['treasurer', 'super_admin', 'screening_committee']), async (req, res) => {
  try {
    const loanId = await Loan.create(req.body);
    res.status(201).json({ 
      message: 'Loan created successfully', 
      loanId 
    });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update loan
router.put('/:id', authenticate, authorize(['treasurer', 'super_admin', 'screening_committee']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await Loan.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.json({ message: 'Loan updated successfully' });
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete loan
router.delete('/:id', authenticate, authorize(['treasurer', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Loan.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;