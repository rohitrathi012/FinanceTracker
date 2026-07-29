const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'finance_tracker_super_secret_key_12345', {
    expiresIn: '30d'
  });
};

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Set first user to be admin for convenience
    const isFirstUser = (await User.countDocuments({})) === 0;

    const user = await User.create({
      username,
      email,
      password,
      isAdmin: isFirstUser
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        currency: user.currency,
        language: user.language,
        theme: user.theme,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { emailOrUsername, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    });

    if (user && (await user.comparePassword(password))) {
      if (user.status === 'blocked') {
        return res.status(403).json({ success: false, message: 'Your account is blocked' });
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          currency: user.currency,
          language: user.language,
          theme: user.theme,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        currency: updatedUser.currency,
        language: updatedUser.language,
        theme: updatedUser.theme,
        isAdmin: updatedUser.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  const { currency, language, theme } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (currency) user.currency = currency;
    if (language) user.language = language;
    if (theme) user.theme = theme;

    const updatedUser = await user.save();
    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        currency: updatedUser.currency,
        language: updatedUser.language,
        theme: updatedUser.theme,
        isAdmin: updatedUser.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Simple mock password reset to "reset12345"
    user.password = "reset12345";
    await user.save();
    res.json({
      success: true,
      message: 'Temporary password set to reset12345. Please log in and change it immediately.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
