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

// ✅ SIMPLE & SAFE CORS (works for Railway, Vercel, Netlify, localhost)
app.use(
  cors({
    origin: true, // allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// =======================
// MongoDB Connection
// =======================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
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
// Health Check (Frontend + Railway)
// =======================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "FinFlow API is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Root route (Railway check)
app.get("/", (req, res) => {
  res.status(200).json({
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
  console.error("❌ Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

// =======================
// Start Server (Railway compatible)
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
