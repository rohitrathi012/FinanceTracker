const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Automatically check for suspicious expenses (e.g., > 25,000 INR or 5x median expense)
    const recentExpenses = await Transaction.find({ userId, type: 'expense', date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    for (const exp of recentExpenses) {
      if (exp.amount > 25000) {
        const msg = `Suspicious Transaction Alert: A large expense of ₹${exp.amount} on ${exp.category} was recorded recently.`;
        const exists = await Notification.findOne({ userId, type: 'suspicious', message: msg });
        if (!exists) {
          await Notification.create({ userId, type: 'suspicious', message: msg });
        }
      }
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
