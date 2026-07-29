const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { setBudget, getBudgets, deleteBudget } = require('../controllers/budgetController');

router.use(protect);

router.route('/')
  .post(setBudget)
  .get(getBudgets);

router.delete('/:id', deleteBudget);

module.exports = router;
