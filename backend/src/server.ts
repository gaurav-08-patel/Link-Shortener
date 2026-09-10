import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

dotenv.config({ quiet: true });

const app = express();
const httpServer = createServer(app);
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [
  frontendOrigin,
  "https://uptimerobot.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

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

const mongoUri = process.env.MONGO_DB_URI;
if (!mongoUri) {
  throw new Error("MONGO_DB_URI is required");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

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

import authRoutes from "./routes/auth.routes.js";
import linkRoutes from "./routes/link.routes.js";
import { redirectUser } from "./controllers/redirect.controller.js";

app.use("/api/auth", authRoutes);
app.use("/api/link", linkRoutes);

// health check
app.get("/health", (_req, res) => {
  res.status(200).send("Server is healthy");
});

// redirect user to originalLink when they visit the shortLink
app.get("/:shortUrlCode", redirectUser);

// SOCKET.IO CONNECTION HANDLER
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// START SERVER
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
