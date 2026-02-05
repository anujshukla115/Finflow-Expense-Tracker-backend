const mongoose = require('mongoose');

const billReminderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    billName: {
        type: String,
        required: [true, 'Bill name is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    reminderDays: {
        type: Number,
        default: 3
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringFrequency: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly']
    }
}, {
    timestamps: true
});

billReminderSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('BillReminder', billReminderSchema);