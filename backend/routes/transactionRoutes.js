const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getDashboardStats
} = require('../controllers/transactionController');

// Multer storage setup
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Images only (jpeg, jpg, png)!'));
  }
});

router.use(protect);

router.route('/')
  .post(upload.single('receipt'), addTransaction)
  .get(getTransactions);

router.get('/dashboard-stats', getDashboardStats);

router.route('/:id')
  .put(upload.single('receipt'), updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
