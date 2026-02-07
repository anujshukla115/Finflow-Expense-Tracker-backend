const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true
    },
    icon: {
        type: String,
        default: '📝'
    },
    color: {
        type: String,
        default: '#4361ee'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

categorySchema.index({ user: 1 });

module.exports = mongoose.model('Category', categorySchema);