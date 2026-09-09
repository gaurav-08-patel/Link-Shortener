import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config({ quiet: true });

const app = express();
const httpServer = createServer(app); // NEW: wrap Express in HTTP server
export const io = new Server(httpServer, {
  cors: { origin: "*" }, // allow frontend connections
});

mongoose
  .connect(process.env.MONGO_DB_URI || "")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from "./routes/auth.routes.js";
import linkRoutes from "./routes/link.routes.js";
import { redirectUser } from "./controllers/redirect.controller.js";

app.use("/api/auth", authRoutes);
app.use("/api/link", linkRoutes);

// redirect user to originalLink when they visit the shortLink
app.get("/:shortUrlCode", redirectUser);

// health check
app.get("/health", (_req, res) => {
  res.status(200).send("Server is healthy");
});

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
