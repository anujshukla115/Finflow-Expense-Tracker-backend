const mongoose = require('mongoose');

const splitExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    splitMethod: {
        type: String,
        enum: ['equal', 'percentage', 'exact', 'shares'],
        default: 'equal'
    },
    members: [{
        name: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        percentage: Number,
        shares: Number,
        isPaid: {
            type: Boolean,
            default: false
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

splitExpenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('SplitExpense', splitExpenseSchema);