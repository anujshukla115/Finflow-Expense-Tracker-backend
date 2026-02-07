const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

// Get all expenses for user
router.get('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, category, type } = req.query;
        
        let query = { user: req.userId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (category) {
            query.category = category;
        }
        
        if (type) {
            query.type = type;
        }
        
        const expenses = await Expense.find(query).sort({ date: -1 });
        
        res.json({
            success: true,
            expenses
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Create expense
router.post('/', auth, async (req, res) => {
    try {
        const expense = new Expense({
            user: req.userId,
            ...req.body
        });
        
        await expense.save();
        
        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            expense
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!expense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Expense not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Expense updated successfully',
            expense
        });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!expense) {
            return res.status(404).json({ 
                success: false, 
                message: 'Expense not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get expense statistics
router.get('/stats/summary', auth, async (req, res) => {
    try {
        const { month, year } = req.query;
        
        let matchQuery = { user: req.userId };
        
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            matchQuery.date = { $gte: startDate, $lte: endDate };
        }
        
        const stats = await Expense.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const categoryStats = await Expense.aggregate([
            { $match: { ...matchQuery, type: 'expense' } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);
        
        res.json({
            success: true,
            stats,
            categoryStats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;