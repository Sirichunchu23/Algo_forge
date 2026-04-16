const express = require('express');
const router = express.Router();
const { submitSolution, getMySubmissions, getSubmission, getAllMySubmissions } = require('../controllers/submission.controller');
const { authenticate } = require('../middleware/auth.middleware');
router.post('/', authenticate, submitSolution);
router.get('/me', authenticate, getAllMySubmissions);
router.get('/problem/:problemId', authenticate, getMySubmissions);
router.get('/:id', authenticate, getSubmission);
module.exports = router;
