const SavingsGoal = require('../models/SavingsGoal');
const Transaction = require('../models/Transaction');

exports.createGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate } = req.body;
  try {
    const goal = await SavingsGoal.create({
      userId: req.user._id,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      targetDate: new Date(targetDate)
    });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id });

    // Calculate historical monthly savings rate
    // Average Monthly Income - Average Monthly Expense
    const startOfTime = new Date();
    startOfTime.setMonth(startOfTime.getMonth() - 3); // last 3 months

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: startOfTime }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    // Monthly average (divided by 3)
    const avgMonthlySavings = Math.max(0, (totalIncome - totalExpense) / 3);

    const goalsWithProjections = goals.map(goal => {
      const remaining = goal.targetAmount - goal.currentAmount;
      const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

      let estimatedCompletionDate = 'N/A';
      if (remaining <= 0) {
        estimatedCompletionDate = 'Goal Achieved!';
      } else if (avgMonthlySavings > 0) {
        const monthsNeeded = remaining / avgMonthlySavings;
        const compDate = new Date();
        compDate.setMonth(compDate.getMonth() + Math.ceil(monthsNeeded));
        estimatedCompletionDate = compDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      } else {
        estimatedCompletionDate = 'Unknown (Add income or cut expenses)';
      }

      return {
        _id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        progressPercent,
        estimatedCompletionDate
      };
    });

    res.json({ success: true, goals: goalsWithProjections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate } = req.body;
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    if (name) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = parseFloat(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = parseFloat(currentAmount);
    if (targetDate) goal.targetDate = new Date(targetDate);

    await goal.save();
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }
    await goal.deleteOne();
    res.json({ success: true, message: 'Savings goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
