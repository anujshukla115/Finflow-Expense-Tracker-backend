const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RecurringExpense = require('../models/RecurringExpense');

// Get all recurring expenses
router.get('/', auth, async (req, res) => {
    try {
        const recurringExpenses = await RecurringExpense.find({ 
            user: req.userId 
        }).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            recurringExpenses
        });
    } catch (error) {
        console.error('Get recurring expenses error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Create recurring expense
router.post('/', auth, async (req, res) => {
    try {
        const recurringExpense = new RecurringExpense({
            user: req.userId,
            ...req.body
        });
        
        await recurringExpense.save();
        
        res.status(201).json({
            success: true,
            message: 'Recurring expense created successfully',
            recurringExpense
        });
    } catch (error) {
        console.error('Create recurring expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Update recurring expense
router.put('/:id', auth, async (req, res) => {
    try {
        const recurringExpense = await RecurringExpense.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!recurringExpense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Recurring expense not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Recurring expense updated successfully',
            recurringExpense
        });
    } catch (error) {
        console.error('Update recurring expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Delete recurring expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const recurringExpense = await RecurringExpense.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!recurringExpense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Recurring expense not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Recurring expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete recurring expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Toggle active status
router.patch('/:id/toggle', auth, async (req, res) => {
    try {
        const recurringExpense = await RecurringExpense.findOne({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!recurringExpense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Recurring expense not found' 
            });
        }
        
        recurringExpense.isActive = !recurringExpense.isActive;
        await recurringExpense.save();
        
        res.json({
            success: true,
            message: `Recurring expense ${recurringExpense.isActive ? 'activated' : 'deactivated'}`,
            recurringExpense
        });
    } catch (error) {
        console.error('Toggle recurring expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;