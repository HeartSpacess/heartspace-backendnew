const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { check, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authmiddleware"); // Middleware for JWT authentication

// ✅ Fetch All Posts (Latest First)
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (error) {
        console.error("Error fetching posts:", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

// ✅ Create a New Post (User must be authenticated)
router.post(
    "/",
    authMiddleware, // Ensures only logged-in users can create posts
    [check("content", "Post content cannot be empty").not().isEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { content } = req.body;
            const user = req.user; // Extract user data from JWT token

            if (!user || !user.userId) {
                return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
            }

            const newPost = new Post({
                userId: user.userId,
                name: user.name || "Anonymous",
                profilePic: user.profilePic || "default-avatar.png",
                content,
            });

            await newPost.save();

            res.status(201).json({ success: true, message: "Post created successfully", post: newPost });
        } catch (error) {
            console.error("Error creating post:", error.message);
            res.status(500).json({ success: false, message: "Server Error", error: error.message });
        }
    }
);

// ✅ Get Posts of a Specific User (Latest First)
router.get("/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });

        if (!posts.length) {
            return res.status(404).json({ success: false, message: "No posts found for this user." });
        }

        res.json({ success: true, posts });
    } catch (error) {
        console.error("Error fetching user posts:", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

module.exports = router;
