import express from "express";
import { shortenLink } from "../controllers/link.controller.js";

const router = express.Router();

router.post("/shorten",shortenLink);

export default router;