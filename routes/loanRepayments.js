const express = require('express');
const LoanRepayment = require('../models/LoanRepayment');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all loan repayments
router.get('/', authenticate, authorize(['treasurer', 'super_admin']), async (req, res) => {
  try {
    const repayments = await LoanRepayment.getAll();
    res.json(repayments);
  } catch (error) {
    console.error('Get loan repayments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get loan repayments by user ID
router.get('/user/:userID', authenticate, async (req, res) => {
  try {
    const { userID } = req.params;
    
    // Members can only view their own repayments
    if (req.user.role === 'member' && req.user.id !== parseInt(userID)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const repayments = await LoanRepayment.getByUserId(userID);
    res.json(repayments);
  } catch (error) {
    console.error('Get user loan repayments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new loan repayment
router.post('/', authenticate, authorize(['treasurer', 'super_admin']), async (req, res) => {
  try {
    const repaymentId = await LoanRepayment.create(req.body);
    res.status(201).json({ 
      message: 'Loan repayment created successfully', 
      repaymentId 
    });
  } catch (error) {
    console.error('Create loan repayment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update loan repayment
router.put('/:id', authenticate, authorize(['treasurer', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await LoanRepayment.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Loan repayment not found' });
    }

    res.json({ message: 'Loan repayment updated successfully' });
  } catch (error) {
    console.error('Update loan repayment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete loan repayment
router.delete('/:id', authenticate, authorize(['treasurer', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await LoanRepayment.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Loan repayment not found' });
    }

    res.json({ message: 'Loan repayment deleted successfully' });
  } catch (error) {
    console.error('Delete loan repayment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;