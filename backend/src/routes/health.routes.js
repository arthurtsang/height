const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

// GET /api/health - Health check
router.get('/', healthController.checkHealth.bind(healthController));

module.exports = router;

// Made with Bob
