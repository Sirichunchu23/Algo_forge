const express = require('express');
const router = express.Router();
const {
  getStats, getProblems, getProblemAdmin, createProblem, updateProblem,
  deleteProblem, getUsers, deleteUser, getAllSubmissions,
} = require('../controllers/admin.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

router.use(authenticate, adminOnly);
router.get('/stats', getStats);
router.get('/problems', getProblems);
router.get('/problems/:id', getProblemAdmin);
router.post('/problems', createProblem);
router.put('/problems/:id', updateProblem);
router.delete('/problems/:id', deleteProblem);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/submissions', getAllSubmissions);
module.exports = router;
