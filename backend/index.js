require("dotenv").config();

const express    = require("express");
const mongoose   = require("mongoose");

const corsMiddleware  = require("./middleware/cors");
const analyticsRoutes = require("./routes/analytics");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(corsMiddleware);
app.use(express.json());

// Ensure DB connected on every request (serverless-safe)
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, { dbName: "analytics" });
    }
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// API Routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// 404 for all other routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Local dev only
if (process.env.NODE_ENV !== "production") {
  const http       = require("http");
  const { Server } = require("socket.io");
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

  const PORT = process.env.PORT || 5000;
  mongoose.connect(process.env.MONGODB_URI, { dbName: "analytics" }).then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error("DB Error:", err.message);
    process.exit(1);
  });
}

// Export for Vercel serverless
module.exports = app;
