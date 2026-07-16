require("dotenv").config();

const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");

const connectDB       = require("./db.config/db");
const corsMiddleware  = require("./middleware/cors");
const analyticsRoutes = require("./routes/analytics");
const dashboardRoutes = require("./routes/dashboard");
const initSocket      = require("./socket/activeUsers");

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(corsMiddleware);
app.use(express.json());

app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", port: process.env.PORT });
});

initSocket(io);

const PORT = process.env.PORT || 8000;

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
