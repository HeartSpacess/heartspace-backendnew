const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: String,
    dob: Date,
    phone: String,
    location: String,
    profilePic: { type: String, default: 'default-avatar.png' },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
