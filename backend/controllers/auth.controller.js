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
        year: user.year,
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
    const { id, token } = req.body;

    if (!id || !token)
      return res.status(200).json({ message: "Already logged out" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    await user.save();

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ message: "Logout failed" });
  }
};


