const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadToS3 } = require('../config/s3');

// Register new user
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      gender,
      dateOfBirth,
      religion,
      caste,
      motherTongue,
      education,
      profession,
      location,
      bio
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePhotoUrl = null;

    if (req.file) {
      profilePhotoUrl = await uploadToS3(req.file)
    }

    // const profilePhoto = req.file ? req.file.location : null; // Get S3 file URL

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      gender,
      dateOfBirth,
      religion,
      caste,
      motherTongue,
      education,
      profession,
      location,
      bio,
      profilePhoto: profilePhotoUrl
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isPremium: user.isPremium,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get profile
exports.getProfile = (req, res) => {
  res.json(req.user);
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    // Expect full user object in `user` key inside body
    const userUpdates = req.body.user;
    if (!userUpdates || typeof userUpdates !== 'object') {
      return res.status(400).json({ message: 'User data is required inside `user` object' });
    }

    const allowedUpdates = [
      'fullName',
      'gender',
      'dateOfBirth',
      'religion',
      'caste',
      'motherTongue',
      'education',
      'profession',
      'location',
      'bio',
      'profilePhoto'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (userUpdates[field] !== undefined) {
        updates[field] = userUpdates[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search users by filters (age, religion, location, etc.)
exports.searchUsers = async (req, res) => {
  try {
    const { religion, location, ageFrom, ageTo, gender } = req.query;

    const filter = {};

    if (religion) filter.religion = religion;
    if (location) filter.location = location;
    if (gender) filter.gender = gender;

    if (ageFrom || ageTo) {
      const now = new Date();
      filter.dateOfBirth = {};
      if (ageFrom) {
        // Minimum DOB = today - ageTo years (youngest)
        filter.dateOfBirth.$lte = new Date(now.getFullYear() - ageFrom, now.getMonth(), now.getDate());
      }
      if (ageTo) {
        // Maximum DOB = today - ageFrom years (oldest)
        filter.dateOfBirth.$gte = new Date(now.getFullYear() - ageTo, now.getMonth(), now.getDate());
      }
    }

    const users = await User.find(filter).select('-password');

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};








// register api check format
// Key	Type	Value
// fullName	Text	Ayesha Khan
// email	Text	ayesha@example.com
// password	Text	secret123
// gender	Text	Female
// dateOfBirth	Text	1996-03-10
// religion	Text	Islam
// caste	Text	Sunni
// motherTongue	Text	Urdu
// education	Text	MBA
// profession	Text	HR Manager
// location	Text	Mumbai
// bio	Text	Looking for a life partner who is kind and supportive.
// profilePhoto	File	📁 Choose an image file from your system