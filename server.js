const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection with Better Error Handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Exit if connection fails
    }
};

// ✅ Ensure .env Variables Exist
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing from .env file");
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is missing from .env file");
    process.exit(1);
}

// Call the function to connect
connectDB();

// ✅ Import Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// ✅ Use Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// ✅ Handle 404 Errors
app.use((req, res) => {
    res.status(404).json({ message: "Route Not Found" });
});

// ✅ Handle Unexpected Errors
process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception:", err.message);
    process.exit(1);
});

// ✅ Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
    console.error("💥 Unhandled Rejection:", err.message);
    process.exit(1);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
