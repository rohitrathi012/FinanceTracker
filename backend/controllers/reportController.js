const Transaction = require('../models/Transaction');

exports.getReportData = async (req, res) => {
  const { period } = req.query; // 'daily', 'weekly', 'monthly', 'yearly'
  try {
    const userId = req.user._id;
    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'yearly') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setMonth(now.getMonth() - 1); // default monthly
    }

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Aggregate stats
    let income = 0;
    let expense = 0;
    const categoryBreakdown = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    res.json({
      success: true,
      period,
      startDate,
      income,
      expense,
      savings: Math.max(0, income - expense),
      categoryBreakdown,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    let csvContent = 'Date,Type,Category,Amount,Description\n';
    transactions.forEach(t => {
      const dateStr = t.date.toISOString().split('T')[0];
      const descCleaned = t.description.replace(/"/g, '""');
      csvContent += `${dateStr},${t.type},${t.category},${t.amount},"${descCleaned}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
