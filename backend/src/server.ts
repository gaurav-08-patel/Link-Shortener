import express from "express";
import nodeCrypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

import authRoutes from "./routes/auth.routes.js";
import linkRoutes from "./routes/link.routes.js";
import { redirectUser } from "./controllers/redirect.controller.js";

dotenv.config({ quiet: true });

// Ensure a crypto implementation is available on globalThis
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = nodeCrypto;
}

const app = express();
const httpServer = createServer(app);

const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const allowedOrigins = [
  frontendOrigin,
  "https://uptimerobot.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

// Redis configuration
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is required");
}

// Create Redis publisher and subscriber clients
const pubClient = createClient({
  url: redisUrl,
});

const subClient = pubClient.duplicate();

// Redis error handlers
pubClient.on("error", (err) => {
  console.error("Redis Publisher Error:", err);
});

subClient.on("error", (err) => {
  console.error("Redis Subscriber Error:", err);
});

// Socket.IO configuration
export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  },
});

// MongoDB connection
const mongoUri = process.env.MONGO_DB_URI;

if (!mongoUri) {
  throw new Error("MONGO_DB_URI is required");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/link", linkRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).send("Server is healthy");
});

// Short URL redirect
app.get("/:shortUrlCode", redirectUser);

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server after Redis is ready
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("Connecting to Redis...");

    await Promise.all([pubClient.connect(), subClient.connect()]);

    console.log("Redis Publisher connected");
    console.log("Redis Subscriber connected");

    // Enable communication between Socket.IO replicas
    io.adapter(createAdapter(pubClient, subClient));

    console.log("Socket.IO Redis adapter enabled");

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
