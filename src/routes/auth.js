const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/google", async (req, res) => {
  try {
    const { id, full_name, email, google_data } = req.body;

    // Validation
    if (!id || !email) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user data: id and email are required" 
      });
    }

    // Extract additional fields from google_data if available
    const photo = google_data?.user?.photo || null;
    const givenName = google_data?.user?.givenName || null;
    const familyName = google_data?.user?.familyName || null;

    // 🔍 Check if user already exists
    let existingUser = await User.findOne({ $or: [{ email }, { id }] });

    if (existingUser) {
      // Update lastLogin timestamp
      existingUser.lastLogin = new Date();
      
      // Update fields if they're missing or if new data is provided
      if (photo && !existingUser.photo) existingUser.photo = photo;
      if (givenName && !existingUser.givenName) existingUser.givenName = givenName;
      if (familyName && !existingUser.familyName) existingUser.familyName = familyName;
      if (google_data) existingUser.google_data = google_data;

      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: "User already exists",
        user: existingUser,
      });
    }

    // 🆕 Create new user
    const newUser = new User({
      id,
      full_name,
      email,
      photo,
      givenName,
      familyName,
      lastLogin: new Date(),
      google_data: google_data || null,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "New user created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
