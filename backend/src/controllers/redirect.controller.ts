import { Request, Response } from "express";
import Link from "../models/link.model.js";

export const redirectUser = async (req: Request, res: Response) => {
  try {
    const { shortUrlCode } = req.params;

    const link = await Link.findOne({
      shortUrl: `${process.env.BACKEND_URL}/${shortUrlCode}`,
    });

    if (!link) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    return res.redirect(link.url);
  } catch (error) {
    console.error("Error redirecting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
