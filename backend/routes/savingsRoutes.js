const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal
} = require('../controllers/savingsController');

router.use(protect);

router.route('/')
  .post(createGoal)
  .get(getGoals);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

module.exports = router;
