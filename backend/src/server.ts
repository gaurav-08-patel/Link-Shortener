import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ quiet: true });

let app = express();

mongoose
  .connect(process.env.Mongo_DB_URI || "")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from "./routes/auth.routes.js";
import linkRoutes from "./routes/link.routes.js";
import { redirectUser } from "./controllers/redirect.controller.js";

app.use("/api/auth", authRoutes);
app.use("/api/link", linkRoutes);

//redirect user to originalLink when they visit the shortLink
app.get("/:shortUrlCode",redirectUser);

app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
