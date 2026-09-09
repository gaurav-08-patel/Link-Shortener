import { Request, Response } from "express";

export const shortenLink = async (req: Request, res: Response) => {
    try {
        const { originalUrl } = req.body;

        

    }catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
  