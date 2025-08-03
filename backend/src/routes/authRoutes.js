import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // 1. Import your User model
import bcrypt from "bcryptjs"; // for password hashing

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("✅ Auth route is working!");
});


// 2. Synchronous token generator
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};


router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }
    if (username.length < 3 || username.length > 20) {
      return res
        .status(400)
        .json({ message: "Username must be between 3 and 20 characters." });
    }

    // 3. Check for existing email/username using findOne
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      return res.status(400).json({ message: "Email is already registered." });
    }
    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Generate a default avatar URL
    const avatarUrl = `https://www.gravatar.com/avatar/${email}?d=mp`;

    // 4. Create and save the new user
    const user = new User({
      username,
      email,
      password,
      profileImage: avatarUrl,
    });
    await user.save();

    // 5. Generate a JWT and respond
    const token = generateToken(user._id);
    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 6. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 7. Compare the password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 8. Generate a JWT and respond
    const token = generateToken(user._id);
    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
