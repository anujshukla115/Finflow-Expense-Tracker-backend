const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');

// Get all categories
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.find({ 
            user: req.userId 
        }).sort({ createdAt: 1 });
        
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Create category
router.post('/', auth, async (req, res) => {
    try {
        const category = new Category({
            user: req.userId,
            ...req.body
        });
        
        await category.save();
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Update category
router.put('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: 'Category not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({
            _id: req.params.id,
            user: req.userId,
            isDefault: false // Prevent deletion of default categories
        });
        
        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: 'Category not found or cannot be deleted' 
            });
        }
        
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;