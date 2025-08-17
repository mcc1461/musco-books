// backend/src/middleware/auth.middleware.js
// JWT doğrulama ve korumalı rotalar için middleware

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect_route = async (req, res, next) => {
  try {
    // 1) Authorization header'ını güvenli al
    const auth_header =
      req.headers?.authorization || req.header("Authorization") || "";

    if (!auth_header.startsWith("Bearer ")) {
      console.warn("[auth] bad/missing auth header:", auth_header);
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    const token = auth_header.slice("Bearer ".length).trim();
    if (!token) {
      console.warn("[auth] empty token");
      return res.status(401).json({ message: "Token missing" });
    }

    // 2) JWT doğrula
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      console.error("[auth] jwt verify error:", e.message);
      return res.status(403).json({ message: "Token is not valid" });
    }

    // 3) Payload -> kullanıcıyı bul
    //    (login tarafında ne imzaladıysan aynı key'i kullan: userId / id / _id)
    const user_id = decoded.userId || decoded.id || decoded._id;

    if (!user_id) {
      console.error("[auth] no user id in token payload:", decoded);
      return res.status(403).json({ message: "Token is not valid" });
    }

    const user = await User.findById(user_id).select("-password");
    if (!user) {
      console.warn("[auth] user not found for id:", user_id);
      return res.status(401).json({ message: "Token is not valid" });
    }

    // 4) request'e kullanıcıyı ekle ve devam et
    req.user = user;
    next();
  } catch (error) {
    console.error("[auth] unexpected error:", error);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export default protect_route;
