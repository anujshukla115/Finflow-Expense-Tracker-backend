// =======================
// FinFlow Backend Server
// =======================

// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// =======================
// Middleware
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =======================
// CORS
// =======================
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// =======================
// MongoDB Connection
// =======================
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};

connectDB();

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
  res.status(200).json({
    success: true,
    status: "OK",
    message: "FinFlow API is running",
    timestamp: new Date().toISOString()
  });
});

// =======================
// Root Route
// =======================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "FinFlow Backend",
    status: "Running",
    environment: process.env.NODE_ENV || "development"
  });
});

// =======================
// 404 Handler
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// =======================
// Global Error Handler
// =======================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

// =======================
// Export App for Vercel
// =======================
module.exports = app;
