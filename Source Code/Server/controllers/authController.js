const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// Generate a JWT that expires in 7 days
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, organisationName } = req.body;

    if (!name || !email || !password || !organisationName) {
      console.log("Missing fields:", { name: !!name, email: !!email, password: !!password, organisationName: !!organisationName });
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, organisationName });
    console.log("User created successfully:", user._id);

    res.status(201).json({
      message: "Account created successfully",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, organisationName: user.organisationName },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // select:false on password field — must opt-in explicitly
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, organisationName: user.organisationName },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/auth/me
// @access  Private
// Lets the frontend re-fetch fresh user data (e.g. after profile update in another tab)
const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      organisationName: req.user.organisationName,
    },
  });
};

// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, organisationName } = req.body;

    if (!name?.trim() || !organisationName?.trim())
      return res.status(400).json({ message: "Name and organisation name are required" });

    req.user.name             = name.trim();
    req.user.organisationName = organisationName.trim();
    await req.user.save();

    res.status(200).json({
      message: "Profile updated",
      user: { id: req.user._id, name: req.user.name, email: req.user.email, organisationName: req.user.organisationName },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    // Re-fetch with password since it's hidden by select:false
    const userWithPw = await User.findById(req.user._id).select("+password");

    const isMatch = await userWithPw.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    userWithPw.password = newPassword; // pre-save hook hashes it
    await userWithPw.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { signup, login, getMe, updateProfile, changePassword };
