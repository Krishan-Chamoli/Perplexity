import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const user = await User.create({ username, email, password });
  const token = generateToken(user._id);

  res.status(201).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
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
