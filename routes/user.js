const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, monthlyIncome, monthlyBudget, currency, theme } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (monthlyIncome !== undefined) updateData.monthlyIncome = monthlyIncome;
        if (monthlyBudget !== undefined) updateData.monthlyBudget = monthlyBudget;
        if (currency) updateData.currency = currency;
        if (theme) updateData.theme = theme;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                monthlyIncome: user.monthlyIncome,
                monthlyBudget: user.monthlyBudget,
                currency: user.currency,
                theme: user.theme
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Change password
router.put('/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide current and new password' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 6 characters' 
            });
        }
        
        const user = await User.findById(req.userId);
        
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;