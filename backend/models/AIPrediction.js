const mongoose = require('mongoose');

const AIPredictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // Format: 'YYYY-MM'
  predictedExpense: { type: Number, required: true },
  analysis: { type: String, default: '' },
  recommendations: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIPrediction', AIPredictionSchema);
