import User from "../models/Users.js";
import { checkUserExists, generateTokens, sendOtp } from "./helperFunctions.js";
import bcrypt from "bcrypt";

// SIGNUP
export const signup = async (req, res) => {
  try {
    const user = req.body;
    const result = await sendOtp(user, "signup");
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const user = {
      email: req.body?.email,
      password: req.body?.newPassword,
      type: req.body?.type,
    };
    const result = await sendOtp(user, "reset");
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    console.error("Password Reset error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await checkUserExists(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    // Calculate streak based on daily login
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      const lastLoginDay = new Date(
        lastLogin.getFullYear(),
        lastLogin.getMonth(),
        lastLogin.getDate()
      );
      const diffTime = today.getTime() - lastLoginDay.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day login - increment streak
        user.streak = (user.streak || 0) + 1;
      } else if (diffDays > 1) {
        // Missed a day - reset streak
        user.streak = 1;
      }
      // If diffDays === 0, same day login, don't change streak
    } else {
      // First login ever
      user.streak = 1;
    }

    // Update best streak if current streak is higher
    if (user.streak > (user.bestStreak || 0)) {
      user.bestStreak = user.streak;
    }

    user.lastLoginDate = now;

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokens.push(refreshToken);

    await user.save();

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        semester: user.semester,
        streak: user.streak,
      },
    });
  } catch (err) {
    console.error("loginFlow error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    let { id, token } = req.body;

    if (!id || !token) {
      return res.status(200).json({ message: "Already logged out" });
    }

    token = token.trim();
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      token = token.slice(1, -1);
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const beforeCount = user.refreshTokens.length;
    user.refreshTokens = user.refreshTokens.filter((t) => t === token);

    if (beforeCount === user.refreshTokens.length) {
      user.refreshTokens = [];
    }

    await user.save();

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ message: "Logout failed" });
  }
};
