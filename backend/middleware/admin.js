import jwt from "jsonwebtoken";
import User from "../models/Users.js";

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      const authHeader =
        req.headers.authorization || req.headers["x-access-token"] || "";
      if (authHeader) {
        const token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : authHeader;
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          // normalize id/email names in payload
          req.user = {
            id: payload.id || payload._id || payload.userId,
            email: payload.email || payload?.user?.email,
          };
        } catch (err) {
          console.warn(
            "Token verify failed in isAdmin middleware:",
            err.message
          );
        }
      }
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    const admins = (process.env.ADMIN || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!user || !admins.includes(user.email)) {
      return res
        .status(403)
        .json({ message: "Forbidden - Admin access required" });
    }

    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default isAdmin;
