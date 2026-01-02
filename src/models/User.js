const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true, // Google ID
    },
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    photo: {
      type: String,
      default: null,
    },
    givenName: {
      type: String,
      default: null,
    },
    familyName: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    google_data: {
      type: Object,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
