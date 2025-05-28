const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  gender: String,
  dateOfBirth: Date,
  religion: String,
  caste: String,
  motherTongue: String,
  education: String,
  profession: String,
  location: String,
  bio: String,
  profilePhoto: String,
  isPremium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

module.exports = mongoose.model("User", userSchema);
