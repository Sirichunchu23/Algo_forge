const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/execute.controller');
const { authenticate } = require('../middleware/auth.middleware');
router.post('/run', authenticate, runCode);
module.exports = router;
