const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

/* =====================
   MIDDLEWARE
===================== */
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'https://finflow-expense-tracker.netlify.app'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================
   ROUTES
===================== */

// HEALTH CHECK - MUST BE BEFORE AUTH MIDDLEWARE
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// SIMPLE TEST ROUTE
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Import routes (DELAY imports until after basic routes)
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const userRoutes = require('./routes/users');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

/* =====================
   ERROR HANDLERS
===================== */
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

/* =====================
   DATABASE + SERVER
===================== */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

// Start server even if MongoDB fails
const startServer = async () => {
    try {
        if (MONGO_URI) {
            await mongoose.connect(MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // Timeout after 5s
                socketTimeoutMS: 45000, // Close sockets after 45s
            });
            console.log('✅ MongoDB connected');
        } else {
            console.log('⚠️  MONGO_URI not set, running without database');
        }
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🧪 Test route: http://localhost:${PORT}/api/test`);
        });
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.log('⚠️  Starting server without database connection...');
        
        // Start server anyway for healthcheck
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} (without DB)`);
        });
    }
};

startServer();

module.exports = app;
