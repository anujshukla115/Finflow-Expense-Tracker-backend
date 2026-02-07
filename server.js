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

// Enhanced CORS configuration for Railway
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        // Local development
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://localhost:5000",
        // Railway domains
        "https://*.railway.app",
        "https://finflow-expense-tracker-backend-production.up.railway.app",
        // Add your frontend domain here when deployed
        process.env.CLIENT_URL,
      ].filter(Boolean); // Remove any undefined values

      // Check if the origin is allowed
      if (
        allowedOrigins.some(
          (allowedOrigin) =>
            origin === allowedOrigin ||
            origin.endsWith(".railway.app") ||
            allowedOrigin === "*"
        )
      ) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// =======================
// MongoDB Connection
// =======================

console.log("Environment:", process.env.NODE_ENV);
console.log("MongoDB URI present:", !!process.env.MONGO_URI);

mongoose.set("strictQuery", false);

const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log("✅ MongoDB Connected Successfully");
      console.log("Database:", mongoose.connection.name);
    })
    .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
      console.log("Retrying connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
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
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }[dbStatus];

  res.json({
    status: "OK",
    message: "FinFlow API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatusText,
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Test route for debugging
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    clientUrl: process.env.CLIENT_URL,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
  });
});

// =======================
// 404 Handler
// =======================
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// =======================
// Error Handling Middleware
// =======================
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.stack);

  // CORS error
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy: Origin not allowed",
      origin: req.headers.origin,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 Railway: https://finflow-expense-tracker-backend-production.up.railway.app`);
  console.log(`📊 Health: https://finflow-expense-tracker-backend-production.up.railway.app/api/health`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
});

// =======================
// Graceful Shutdown
// =======================
const gracefulShutdown = () => {
  console.log("Received shutdown signal, closing connections...");

  server.close(() => {
    console.log("HTTP server closed");

    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
