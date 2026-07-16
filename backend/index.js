require("dotenv").config();

const express  = require("express");
const mongoose = require("mongoose");

const corsMiddleware  = require("./middleware/cors");
const analyticsRoutes = require("./routes/analytics");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// Health check — BEFORE DB middleware so it always responds
app.get("/ping", (req, res) => res.json({ status: "pong" }));
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    env: !!process.env.MONGODB_URI ? "set" : "MISSING",
  });
});

// CORS must be first
app.use(corsMiddleware);
app.use(express.json());

// Serverless-safe DB connection middleware
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, { dbName: "analytics" });
    }
    next();
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// API Routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// (health endpoint moved above DB middleware)

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── LOCAL DEV ONLY: Socket.IO + HTTP server ───────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const http       = require("http");
  const path       = require("path");
  const { Server } = require("socket.io");
  const connectDB  = require("./db.config/db");
  const initSocket = require("./socket/activeUsers");

  const server = http.createServer(app);

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",").map((o) => o.trim()).filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          return cb(null, true);
        }
        return cb(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  initSocket(io);

  // Serve static builds locally
  app.use("/dashborad", express.static(path.join(__dirname, "../dashborad-frontend/dashborad/dist")));
  app.use(express.static(path.join(__dirname, "../frontend/vite-project/dist")));

  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} busy. Run: npx kill-port ${PORT}`);
        process.exit(1);
      }
    });
  });
}

// Export for Vercel serverless
module.exports = app;
