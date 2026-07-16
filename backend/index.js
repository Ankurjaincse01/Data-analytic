require("dotenv").config();

const express    = require("express");
const http       = require("http");
const path       = require("path");
const mongoose   = require("mongoose");
const { Server } = require("socket.io");

const connectDB       = require("./db.config/db");
const corsMiddleware  = require("./middleware/cors");
const analyticsRoutes = require("./routes/analytics");
const dashboardRoutes = require("./routes/dashboard");
const initSocket      = require("./socket/activeUsers");

const app    = express();
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

app.use(corsMiddleware);
app.use(express.json());

// Ensure DB is connected on every request (serverless-safe)
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "DB connection failed" });
  }
});

// API Routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// Static files — only in local dev (dist folders don't exist on Vercel)
if (process.env.NODE_ENV !== "production") {
  app.use("/dashborad", express.static(path.join(__dirname, "../dashborad-frontend/dashborad/dist")));
  app.use(express.static(path.join(__dirname, "../frontend/vite-project/dist")));

  app.get(/^\/dashborad/, (req, res) => {
    res.sendFile(path.join(__dirname, "../dashborad-frontend/dashborad/dist/index.html"));
  });

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/vite-project/dist/index.html"));
  });
} else {
  // On Vercel: return 404 for unknown routes so API errors are clear
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
}

initSocket(io);

// Local dev server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is busy. Kill it with: npx kill-port ${PORT}`);
        process.exit(1);
      }
    });
  });
}

// Export for Vercel serverless
module.exports = app;
