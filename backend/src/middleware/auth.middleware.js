import jwt from "jsonwebtoken";
import User from "../models/User.js"; // 1. Import your User model

// const response = await fetch(`http://localhost:3011/api/books`, {
//   method: "POST",
//   body: JSON.stringify({
//     title,
//     caption,
//     rating,
//     image,
//     user: req.user.id,
//   }),
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   },
// });

// Middleware to protect routes
const protectRoute = async (req, res, next) => {
  try {
    // 1) Grab the header
    const authHeader = req.headers["authorization"];
    // 2) Format: "Bearer
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      // No token → 401
      return res
        .status(401)
        .json({ message: "No authorization token, access denied" });
    }
    // 3) Verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    // 4) Check if the user exists
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      // User not found → 403
      return res.status(403).json({ message: "User not found" });
    }

    // 5) Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export default protectRoute;
