// =======================
// FinFlow Backend Server
// =======================

// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path"); // Add this line

const app = express();

// =======================
// Middleware
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration for production
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
].filter(Boolean); // Remove undefined/null values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// =======================
// MongoDB Connection
// =======================

// Debug (temporary – helps confirm env is read correctly)
console.log("DEBUG MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");

// Ensure MongoDB URI is available
if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI environment variable is not set");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// =======================
// Routes
// =======================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/expenses", require("./routes/expense"));
app.use("/api/recurring", require("./routes/recurring"));
app.use("/api/bills", require("./routes/bills"));
app.use("/api/split", require("./routes/split"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/user", require("./routes/user"));

// =======================
// Health Check
// =======================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "FinFlow API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route for Railway health checks
app.get("/", (req, res) => {
  res.json({
    message: "FinFlow Expense Tracker API",
    version: "1.0.0",
    status: "operational",
    documentation: "/api/health for health check"
  });
});

// =======================
// Error Handling Middleware
// =======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
