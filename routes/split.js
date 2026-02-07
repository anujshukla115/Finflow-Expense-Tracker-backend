const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SplitExpense = require('../models/SplitExpense');

// Get all split expenses
router.get('/', auth, async (req, res) => {
    try {
        const splitExpenses = await SplitExpense.find({ 
            user: req.userId 
        }).sort({ date: -1 });
        
        res.json({
            success: true,
            splitExpenses
        });
    } catch (error) {
        console.error('Get split expenses error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Create split expense
router.post('/', auth, async (req, res) => {
    try {
        const splitExpense = new SplitExpense({
            user: req.userId,
            ...req.body
        });
        
        await splitExpense.save();
        
        res.status(201).json({
            success: true,
            message: 'Split expense created successfully',
            splitExpense
        });
    } catch (error) {
        console.error('Create split expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Update split expense
router.put('/:id', auth, async (req, res) => {
    try {
        const splitExpense = await SplitExpense.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!splitExpense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Split expense not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Split expense updated successfully',
            splitExpense
        });
    } catch (error) {
        console.error('Update split expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Delete split expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const splitExpense = await SplitExpense.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!splitExpense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Split expense not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Split expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete split expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Mark member as paid
router.patch('/:id/member/:memberIndex/pay', auth, async (req, res) => {
    try {
        const splitExpense = await SplitExpense.findOne({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!splitExpense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Split expense not found' 
            });
        }
        
        const memberIndex = parseInt(req.params.memberIndex);
        if (memberIndex < 0 || memberIndex >= splitExpense.members.length) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid member index' 
            });
        }
        
        splitExpense.members[memberIndex].isPaid = !splitExpense.members[memberIndex].isPaid;
        await splitExpense.save();
        
        res.json({
            success: true,
            message: 'Member payment status updated',
            splitExpense
        });
    } catch (error) {
        console.error('Update member payment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;