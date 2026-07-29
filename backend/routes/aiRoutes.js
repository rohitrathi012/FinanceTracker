const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { autoCategorize, getAIInsights } = require('../controllers/aiController');

router.use(protect);

router.post('/categorize', autoCategorize);
router.get('/insights', getAIInsights);

module.exports = router;
