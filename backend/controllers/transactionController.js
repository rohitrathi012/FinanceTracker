const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

// Helper to check and trigger budget alerts
const checkBudgetAlerts = async (userId, category, dateStr) => {
  try {
    const month = dateStr.substring(0, 7); // 'YYYY-MM'
    const budget = await Budget.findOne({ userId, category, month });
    if (!budget) return;

    // Get total expenses in category this month
    const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);

    const expenses = await Transaction.find({
      userId,
      type: 'expense',
      category,
      date: { $gte: startOfMonth, $lt: endOfMonth }
    });

    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const limit = budget.limit;
    const ratio = totalSpent / limit;

    let warningMsg = null;
    let type = 'budget_alert';

    if (ratio >= 1.0) {
      warningMsg = `Alert: You have exceeded 100% of your ${category} budget of ₹${limit}! Current spend: ₹${totalSpent}.`;
    } else if (ratio >= 0.9) {
      warningMsg = `Warning: You have reached ${Math.floor(ratio * 100)}% of your ${category} budget of ₹${limit}. Current spend: ₹${totalSpent}.`;
    } else if (ratio >= 0.8) {
      warningMsg = `Notice: You have reached ${Math.floor(ratio * 100)}% of your ${category} budget of ₹${limit}. Current spend: ₹${totalSpent}.`;
    }

    if (warningMsg) {
      // Check if alert already exists for this ratio to avoid duplicate spamming
      const existingAlert = await Notification.findOne({
        userId,
        type,
        message: warningMsg
      });

      if (!existingAlert) {
        await Notification.create({
          userId,
          type,
          message: warningMsg
        });
      }
    }
  } catch (err) {
    console.error('Error checking budget alerts:', err);
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    let receiptPath = '';
    if (req.file) {
      receiptPath = `/uploads/${req.file.filename}`;
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: date ? new Date(date) : new Date(),
      receiptPath
    });

    // Check budget alert async if type is expense
    if (type === 'expense') {
      const dateStr = transaction.date.toISOString();
      await checkBudgetAlerts(req.user._id, category, dateStr);
    }

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const sortOption = {};
    sortOption[sortBy] = order === 'asc' ? 1 : -1;

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skipIndex);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { type, amount, category, description, date } = req.body;
    transaction.type = type || transaction.type;
    transaction.amount = amount !== undefined ? parseFloat(amount) : transaction.amount;
    transaction.category = category || transaction.category;
    transaction.description = description || transaction.description;
    if (date) transaction.date = new Date(date);

    if (req.file) {
      // Delete old receipt
      if (transaction.receiptPath) {
        const oldPath = path.join(__dirname, '..', transaction.receiptPath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      transaction.receiptPath = `/uploads/${req.file.filename}`;
    }

    const updatedTransaction = await transaction.save();

    if (updatedTransaction.type === 'expense') {
      const dateStr = updatedTransaction.date.toISOString();
      await checkBudgetAlerts(req.user._id, updatedTransaction.category, dateStr);
    }

    res.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.receiptPath) {
      const receiptFilePath = path.join(__dirname, '..', transaction.receiptPath);
      if (fs.existsSync(receiptFilePath)) {
        fs.unlinkSync(receiptFilePath);
      }
    }

    await transaction.deleteOne();
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpenses += t.amount;
    });

    const totalBalance = totalIncome - totalExpenses;
    const totalSavings = totalBalance > 0 ? totalBalance : 0;

    res.json({
      success: true,
      stats: {
        totalBalance,
        totalIncome,
        totalExpenses,
        totalSavings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
