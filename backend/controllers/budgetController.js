const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

exports.setBudget = async (req, res) => {
  const { category, limit, month } = req.body; // month format: YYYY-MM
  try {
    let budget = await Budget.findOne({ userId: req.user._id, category, month });

    if (budget) {
      budget.limit = parseFloat(limit);
      await budget.save();
    } else {
      budget = await Budget.create({
        userId: req.user._id,
        category,
        limit: parseFloat(limit),
        month
      });
    }

    res.status(200).json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBudgets = async (req, res) => {
  const { month } = req.query; // optional month filter YYYY-MM
  try {
    const query = { userId: req.user._id };
    if (month) query.month = month;

    const budgets = await Budget.find(query);

    // Calculate actual spending for each budget
    const budgetListWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startOfMonth = new Date(`${budget.month}-01T00:00:00.000Z`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);

        const expenses = await Transaction.find({
          userId: req.user._id,
          type: 'expense',
          category: budget.category,
          date: { $gte: startOfMonth, $lt: endOfMonth }
        });

        const spent = expenses.reduce((sum, e) => sum + e.amount, 0);

        return {
          _id: budget._id,
          category: budget.category,
          limit: budget.limit,
          month: budget.month,
          spent
        };
      })
    );

    res.json({ success: true, budgets: budgetListWithSpending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    await budget.deleteOne();
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
