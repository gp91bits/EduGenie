
import express from "express";
import {forgotPassword, login, logout, signup } from "../controllers/auth.controller.js";
import { refreshToken, resendOtp,  verifyOtp } from "../controllers/helperFunctions.js";

const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/forgotPass", forgotPassword);
authRoutes.post("/verify", verifyOtp);
authRoutes.post("/resendotp", resendOtp);
authRoutes.post("/refresh", refreshToken);

export default authRoutes;
