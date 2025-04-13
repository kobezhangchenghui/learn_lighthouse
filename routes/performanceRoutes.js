const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

router.get('/', performanceController.getPerformanceMetrics);

module.exports = router;