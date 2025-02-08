const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

// ✅ Middleware to validate user input
const validateUser = [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please provide a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
];

// ✅ Signup Route
router.post("/signup", validateUser, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password, location } = req.body;

        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({ name, email, password: hashedPassword, location });
        await user.save();

        // Generate JWT Token for automatic login
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: { _id: user._id, name: user.name, email: user.email, location: user.location },
        });
    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

// ✅ Login Route
router.post(
    "/login",
    [
        check("email", "Please provide a valid email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { email, password } = req.body;

            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ success: false, message: "Invalid email or password" });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Invalid email or password" });
            }

            // Generate JWT Token with expiration
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.json({
                success: true,
                message: "Login successful",
                token,
                expiresIn: 3600, // 1 hour in seconds
                user: { _id: user._id, name: user.name, email: user.email, location: user.location },
            });
        } catch (error) {
            console.error("Login Error:", error.message);
            res.status(500).json({ success: false, message: "Server Error", error: error.message });
        }
    }
);

// ✅ Get All Users Route (To Show in Friends List)
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude passwords
        res.json({ success: true, users });
    } catch (error) {
        console.error("Get Users Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

// ✅ Get Specific User Profile by ID (For Profile Page)
router.get("/profile/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error("Get Profile Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

module.exports = router;
