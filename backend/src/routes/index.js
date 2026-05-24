const express = require('express');
const router = express.Router();
const sessionRoutes = require('./session.routes');
const healthRoutes = require('./health.routes');

// Mount routes
router.use('/session', sessionRoutes);
router.use('/health', healthRoutes);

module.exports = router;

// Made with Bob
