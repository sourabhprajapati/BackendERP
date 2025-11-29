// routes/salesExecutive.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Helper: Generate Random Password
const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*#@!";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// CREATE Sales Executive
router.post('/create', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const fullUsername = `${username.trim().toLowerCase()}-sales@mittsure`;

    const existingUser = await User.findOne({ username: fullUsername });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = new User({
      username: fullUsername,
      password: hashedPassword,
      type: 'SALES',
      tempPlainPassword: plainPassword,
    });

    await newUser.save();

    // Return plain password so frontend can show/email it
    res.json({
      success: true,
      message: `Sales executive ${fullUsername} created!`,
      user: {
        id: newUser._id,
        username: newUser.username,
        password: plainPassword, // only this time!
        type: newUser.type,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET All Sales Executives (with search)
// GET All Sales Executives (with search) - ALWAYS SHOW PLAIN PASSWORD
// GET all sales executives — NOW SHOWS PLAIN PASSWORD EVERY TIME
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { type: 'SALES' };

    if (search) {
      query.username = { $regex: search, $options: 'i' };
    }

    // CRITICAL: We need plain password → so we use tempPlainPassword field
    const users = await User.find(query)
      .select('+tempPlainPassword')  // ← This forces MongoDB to send the password
      .sort({ createdAt: -1 });

    const userList = users.map(user => ({
      id: user._id,
      username: user.username,
      password: user.tempPlainPassword || "No password set",  // ← This shows real password
      type: user.type,
      isBlocked: user.isBlocked,
    }));

    res.json({ success: true, users: userList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// CHANGE Password
router.put('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const newPlainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

    const user = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword ,
        tempPlainPassword: newPlainPassword
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      message: "Password changed successfully",
      newPassword: newPlainPassword,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// BLOCK User
router.put('/:id/block', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User blocked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ACTIVATE (Unblock) User
router.put('/:id/activate', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User activated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;