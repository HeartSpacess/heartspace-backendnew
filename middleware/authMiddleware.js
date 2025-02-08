const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "❌ Access denied. No token provided." });
    }

    // ✅ Ensure token is in correct format: "Bearer <token>"
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(400).json({ success: false, message: "❌ Invalid token format. Use 'Bearer <token>'" });
    }

    const token = tokenParts[1];

    try {
        // ✅ Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("❌ JWT_SECRET is missing in .env file");
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId }; // ✅ Ensure userId is correctly stored

        console.log("✅ Token verified for user:", decoded.userId);
        next(); // Move to the next middleware
    } catch (error) {
        console.error("❌ JWT Verification Error:", error.message);
        return res.status(401).json({ success: false, message: "❌ Invalid or expired token" });
    }
};
