const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

// POST /api/session/start - Create new session
router.post('/start', sessionController.startSession.bind(sessionController));

// POST /api/session/:sessionId/answer - Submit answer
router.post('/:sessionId/answer', sessionController.submitAnswer.bind(sessionController));

// GET /api/session/:sessionId/result - Get result
router.get('/:sessionId/result', sessionController.getResult.bind(sessionController));

module.exports = router;

// Made with Bob
