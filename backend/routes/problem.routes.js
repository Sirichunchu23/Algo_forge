const express = require('express');
const router = express.Router();
const { getProblems, getProblem, getCategories } = require('../controllers/problem.controller');
const { authenticate } = require('../middleware/auth.middleware');
router.get('/categories', authenticate, getCategories);
router.get('/', authenticate, getProblems);
router.get('/:slug', authenticate, getProblem);
module.exports = router;
