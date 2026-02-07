const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BillReminder = require('../models/BillReminder');

// Get all bill reminders
router.get('/', auth, async (req, res) => {
    try {
        const bills = await BillReminder.find({ 
            user: req.userId 
        }).sort({ dueDate: 1 });
        
        res.json({
            success: true,
            bills
        });
    } catch (error) {
        console.error('Get bills error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Create bill reminder
router.post('/', auth, async (req, res) => {
    try {
        const bill = new BillReminder({
            user: req.userId,
            ...req.body
        });
        
        await bill.save();
        
        res.status(201).json({
            success: true,
            message: 'Bill reminder created successfully',
            bill
        });
    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Update bill reminder
router.put('/:id', auth, async (req, res) => {
    try {
        const bill = await BillReminder.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!bill) {
            return res.status(404).json({ 
                success: false, 
                message: 'Bill reminder not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Bill reminder updated successfully',
            bill
        });
    } catch (error) {
        console.error('Update bill error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Delete bill reminder
router.delete('/:id', auth, async (req, res) => {
    try {
        const bill = await BillReminder.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!bill) {
            return res.status(404).json({ 
                success: false, 
                message: 'Bill reminder not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Bill reminder deleted successfully'
        });
    } catch (error) {
        console.error('Delete bill error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Mark bill as paid
router.patch('/:id/pay', auth, async (req, res) => {
    try {
        const bill = await BillReminder.findOne({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!bill) {
            return res.status(404).json({ 
                success: false, 
                message: 'Bill reminder not found' 
            });
        }
        
        bill.isPaid = true;
        await bill.save();
        
        res.json({
            success: true,
            message: 'Bill marked as paid',
            bill
        });
    } catch (error) {
        console.error('Mark bill paid error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;