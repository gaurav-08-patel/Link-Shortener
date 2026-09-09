import express from "express";
import { getLinksByUserId, shortenLink } from "../controllers/link.controller.js";

const router = express.Router();

router.post("/shorten",shortenLink);
router.get("/:userId", getLinksByUserId);

export default router;