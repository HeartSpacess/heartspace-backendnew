const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        profilePic: {
            type: String,
            default: "default-avatar.png",
        },
        content: {
            type: String,
            required: true,
        },
        likes: {
            type: Number,
            default: 0,
        },
        comments: {
            type: [String],
            default: [],
        }
    },
    { timestamps: true } // Automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("Post", PostSchema);
