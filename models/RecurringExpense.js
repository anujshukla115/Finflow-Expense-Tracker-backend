const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastProcessed: {
        type: Date
    }
}, {
    timestamps: true
});

recurringExpenseSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);