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

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://127.0.0.1:5500",
    credentials: true,
  })
);

// =======================
// MongoDB Connection
// =======================

// Debug (temporary – helps confirm env is read correctly)
console.log("DEBUG MONGO_URI:", process.env.MONGO_URI);

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

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});
