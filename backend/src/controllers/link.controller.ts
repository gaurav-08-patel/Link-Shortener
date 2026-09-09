import { Request, Response } from "express";
import validUrl from "valid-url";
import { nanoid } from "nanoid";
import Link from "../models/link.model.js";

export const shortenLink = async (req: Request, res: Response) => {
  try {
    const { originalUrl } = req.body;

    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    const shortUrlCode = nanoid(10);

    const shortUrl = `${process.env.BACKEND_URL}/${shortUrlCode}`;

    const newLink = new Link({
      url: originalUrl,
      shortUrl,
      userId: req.body.userId || null, // Assuming userId is optional
    });

    await newLink.save();

    return res.status(201).json({ shortUrl });
  } catch (error) {
    console.error("Error shortening link:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
