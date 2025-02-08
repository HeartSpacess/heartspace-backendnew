const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Initialize Express App
const app = express();

// ✅ Secure CORS Policy (Allow frontend domain in production)
const allowedOrigins = ["http://localhost:5500", "https://your-frontend-domain.com"];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ CORS Not Allowed"));
    }
  },
  credentials: true
}));
app.use(express.json());

// ✅ MongoDB Connection with Retry Mechanism (5 Attempts)
let mongoRetries = 0;
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    mongoRetries++;
    console.error(`❌ MongoDB Connection Error (${mongoRetries}/5):`, error.message);
    if (mongoRetries < 5) {
      setTimeout(connectDB, 5000); // Retry after 5 seconds
    } else {
      console.error("💥 Maximum retry attempts reached. Exiting...");
      process.exit(1);
    }
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

// ✅ Request Logging Middleware
app.use((req, res, next) => {
  console.log(`📌 [${req.method}] ${req.url}`);
  next();
});

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

// ✅ Use Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// ✅ Handle 404 Errors
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route Not Found" });
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

// ✅ Graceful Shutdown (Handle SIGTERM & SIGINT)
const shutdown = async () => {
  console.log("🛑 Closing server...");
  await mongoose.connection.close();
  console.log("✅ MongoDB Disconnected. Exiting...");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
