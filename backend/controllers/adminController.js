const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  const { status } = req.body; // 'active' or 'blocked'
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isAdmin && status === 'blocked') {
      return res.status(400).json({ success: false, message: 'Cannot block an admin user' });
    }

    user.status = status || user.status;
    await user.save();

    res.json({ success: true, message: `User is now ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({ success: true, message: `Admin status toggled`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTransactions = await Transaction.countDocuments({});
    const allTransactions = await Transaction.find({});

    let totalVolume = 0;
    let incomeVolume = 0;
    let expenseVolume = 0;

    allTransactions.forEach(t => {
      totalVolume += t.amount;
      if (t.type === 'income') incomeVolume += t.amount;
      else expenseVolume += t.amount;
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        totalVolume,
        incomeVolume,
        expenseVolume
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
