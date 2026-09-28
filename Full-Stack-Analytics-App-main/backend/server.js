const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(v => v.trim())
    : "*",
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "InsightBoard Analytics API is running",
    version: "1.0.0"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI is not configured. Start-up will continue, but database APIs require MongoDB.");
    } else {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected successfully!");
    }

    app.listen(PORT, () => {
      console.log(`InsightBoard API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
