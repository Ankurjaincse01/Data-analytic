require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./db.config/db");
const corsMiddleware = require("./middleware/cors");
const analyticsRoutes = require("./routes/analytics");
const dashboardRoutes = require("./routes/dashboard");
const initSocket = require("./socket/activeUsers");

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",").map((o) => o.trim()).filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: (origin, cb) => {
            if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
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

app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);

const path = require("path");

// 1. Serve Dashboard static files under the "/dashborad" route
app.use("/dashborad", express.static(path.join(__dirname, "../dashborad-frontend/dashborad/dist")));

// 2. Serve Main Website static files for the root "/" route
app.use(express.static(path.join(__dirname, "../frontend/vite-project/dist")));

// 3. SPA Fallback for Dashboard routes
app.get(/^\/dashborad/, (req, res) => {
    res.sendFile(path.join(__dirname, "../dashborad-frontend/dashborad/dist/index.html"));
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", port: process.env.PORT });
});

// 4. SPA Fallback for Main Website routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/vite-project/dist/index.html"));
});

initSocket(io);

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
