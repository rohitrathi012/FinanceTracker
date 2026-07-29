const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getReportData, exportCSV } = require('../controllers/reportController');

router.use(protect);

router.get('/', getReportData);
router.get('/csv', exportCSV);

module.exports = router;
