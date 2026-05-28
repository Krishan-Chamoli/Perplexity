import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const user = await User.create({ username, email, password });
  const token = generateToken(user._id);

  const emailValidationToken = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
  );

  await sendEmail({
    to: user.email,
    subject: "Welcome to Perplexity!",
    text: 
    `Hi ${user.username},\n\nThank you for registering at Perplexity. 
    To complete your registration, please click the following link to validate your email address:\n\n
     href="http://localhost:${process.env.PORT || 3000}/api/auth/validate-email?token=${emailValidationToken}">Validate Email\n\n
    We're excited to have you on board!\n\nBest regards,\nThe Perplexity Team`,
  });

  res.status(201).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      emailValidationToken,
    },
    token,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});


export const validateEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: "Validation token is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.verified = true;
        await user.save();
        res.status(200).json({ message: "Email validated successfully" });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
});
