const express = require('express');
const router = express.Router();
const { authenticate, requireStaff } = require('../middleware/auth');

// @route   GET /api/upload/health
// @desc    Health check for upload service
// @access  Public
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Upload service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
