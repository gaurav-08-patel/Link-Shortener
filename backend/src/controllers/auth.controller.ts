import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const register = async (req: Request, res: Response) => {
  try {
    const username = String(req.body.username ?? "").trim();
    const email = String(req.body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password ?? "");

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    if (username.length < 3 || username.length > 30) {
      return res
        .status(400)
        .json({ message: "Username must be between 3 and 30 characters" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        message: "Username can only contain letters, numbers, and underscores",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const loginValue = String(
      req.body.username ??
        req.body.email ??
        req.body.usernameOrEmail ??
        req.body.identifier ??
        "",
    ).trim();
    const password = String(req.body.password ?? "");

    if (!loginValue || !password) {
      return res
        .status(400)
        .json({ message: "Username/email and password are required" });
    }

    const normalizedLoginValue = loginValue.toLowerCase();
    const user = await User.findOne({
      $or: [
        {
          username: {
            $regex: `^${loginValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
          },
        },
        {
          email: {
            $regex: `^${normalizedLoginValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
          },
        },
      ],
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const bodyToken = String(req.body.token ?? "").trim();
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : bodyToken;

    if (!token) {
      return res
        .status(400)
        .json({ loggedIn: false, message: "Token is required" });
    }

    const secret = process.env.JWT_SECRET || "mysecretkey";
    const decoded = jwt.verify(token, secret) as {
      id?: string;
      username?: string;
      email?: string;
    };

    return res.status(200).json({
      loggedIn: true,
      message: "Token is valid",
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
      },
    });
  } catch (error) {
    return res
      .status(401)
      .json({ loggedIn: false, message: "Invalid or expired token" });
  }
};
