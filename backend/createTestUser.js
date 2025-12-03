import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/Users.js";

dotenv.config();

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        // Check if user already exists
        const existingUser = await User.findOne({ email: "test@example.com" });
        if (existingUser) {
            console.log("User already exists");
            process.exit(0);
        }

        // Create test user
        const hashedPassword = await bcrypt.hash("Test@123", 10);
        const newUser = new User({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
            semester: 1,
            refreshTokens: [],
            streak: 0,
            bestStreak: 0,
            type: "student",
        });

        await newUser.save();
        console.log("✅ Test user created successfully!");
        console.log("Email: test@example.com");
        console.log("Password: Test@123");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

createTestUser();
