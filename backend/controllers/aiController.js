const Groq = require('groq-sdk');
const Transaction = require('../models/Transaction');
const AIPrediction = require('../models/AIPrediction');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const categories = [
  'Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment',
  'Healthcare', 'Education', 'Travel', 'Salary', 'Investment', 'Other'
];

exports.autoCategorize = async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ success: false, message: 'Description is required' });
  }

  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY is not set. Falling back to Other.");
    return res.json({ success: true, category: 'Other' });
  }

  try {
    const prompt = `Categorize the following transaction description into exactly one of these categories: [${categories.join(', ')}]. \n\nTransaction Description: "${description}"\n\nReturn ONLY the category name as a plain string, nothing else.`;

    const result = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile'
    });
    const text = result.choices[0].message.content.trim();

    // Verify if it's a valid category
    const matchedCategory = categories.find(c => c.toLowerCase() === text.toLowerCase()) || 'Other';

    res.json({ success: true, category: matchedCategory });
  } catch (error) {
    console.error("AI Categorize Error:", error);
    res.json({ success: true, category: 'Other' }); // Fallback on error
  }
};

exports.getAIInsights = async (req, res) => {
  console.log("GROQ_API_KEY =", process.env.GROQ_API_KEY);
  try {
    console.log("========== AI DEBUG ==========");
    console.log("API KEY:", process.env.GROQ_API_KEY ? "FOUND" : "NOT FOUND");
    console.log("User:", req.user);

    const userId = req.user._id;

    // Get transactions for the user
    const transactions = await Transaction.find({ userId }).sort({ date: 1 });
    if (transactions.length === 0) {
      return res.json({
        success: true,
        message: 'Add some transactions to enable AI Insights!',
        predictions: { predictedExpense: 0, analysis: 'No transaction data available yet.', recommendations: [] }
      });
    }

    // Determine target month (next month)
    const targetMonth = new Date();
    targetMonth.setMonth(targetMonth.getMonth() + 1);
    const targetMonthStr = targetMonth.toISOString().substring(0, 7);

    // If Groq API is missing, return fallback
    if (!process.env.GROQ_API_KEY) {
      return res.json({
        success: true,
        predictions: {
          predictedExpense: 0,
          analysis: "Please configure GROQ_API_KEY in the backend .env to enable insights.",
          recommendations: ["Missing Groq API Key"]
        }
      });
    }

    // Summarize data for prompt to save tokens
    const recentTx = transactions.slice(-100); // Last 100 transactions
    const txSummary = recentTx.map(t => `${t.date.toISOString().split('T')[0]} | ${t.type} | ${t.category} | ${t.amount} | ${t.description}`).join('\n');

    const prompt = `
You are a highly intelligent financial advisor AI.
Analyze the following recent transaction history of a user.
Transaction Format: Date | Type (income/expense) | Category | Amount | Description

Transaction History:
${txSummary}

Based on this data, provide:
1. "predictedExpense": A numerical prediction for the user's total expenses next month (just a number).
2. "analysis": A short paragraph summarizing their spending patterns, detecting any anomalies, spikes, or good habits.
3. "recommendations": An array of 3 specific, actionable advice strings to improve their financial health.

Respond ONLY with valid JSON in the following format:
{
  "predictedExpense": 1234,
  "analysis": "string",
  "recommendations": ["string1", "string2", "string3"]
}`;
    console.log("Calling Groq API...");
    const result = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile'
    });
    console.log("Groq Response:");
    console.log(result);
    const responseText = result.choices[0].message.content;
    
    // Extract JSON block in case there are markdown ticks
    let jsonStr = responseText;
    const match = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match) {
        jsonStr = match[1];
    }

    const aiData = JSON.parse(jsonStr);

    // Save prediction record
    await AIPrediction.findOneAndUpdate(
      { userId, month: targetMonthStr },
      {
        predictedExpense: aiData.predictedExpense || 0,
        analysis: aiData.analysis || 'Analysis unavailable.',
        recommendations: aiData.recommendations || []
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      predictions: {
        predictedExpense: aiData.predictedExpense || 0,
        analysis: aiData.analysis || 'Analysis unavailable.',
        recommendations: aiData.recommendations || []
      }
    });

  } catch (error) {
  console.error("========== AI ERROR ==========");
  console.error(error);

  res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack
  });
}
};
