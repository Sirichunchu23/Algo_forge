const Submission = require('../models/Submission.model');
const Problem = require('../models/Problem.model');
const User = require('../models/User.model');
const { executeSubmission } = require('../utils/executor');

// POST /api/submissions - submit solution
const submitSolution = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language)
      return res.status(400).json({ success: false, message: 'problemId, code, and language are required.' });

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    if (!code.trim()) return res.status(400).json({ success: false, message: 'Code cannot be empty.' });

    // Execute against ALL test cases
    const { results, status, passedCount, totalCount, runtime } = await executeSubmission(
      code, language, problem.functionName, problem.testCases
    );

    // Save submission
    const submission = await Submission.create({
      user: req.user._id,
      problem: problem._id,
      code,
      language,
      status,
      runtime,
      testResults: results,
      passedCount,
      totalCount,
      errorMessage: results.find(r => r.error)?.error || '',
    });

    // Update problem stats
    await Problem.findByIdAndUpdate(problem._id, {
      $inc: {
        totalSubmissions: 1,
        acceptedSubmissions: status === 'Accepted' ? 1 : 0,
      }
    });

    // Update user stats if first accepted solution
    if (status === 'Accepted') {
      const alreadySolved = await Submission.findOne({
        user: req.user._id,
        problem: problem._id,
        status: 'Accepted',
        _id: { $ne: submission._id },
      });

      if (!alreadySolved) {
        const diffField = `stats.${problem.difficulty.toLowerCase()}Solved`;
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { 'stats.solved': 1, [diffField]: 1 },
          $addToSet: { solvedProblems: problem._id },
        });
      }
    }

    // Mark attempted
    const prevAttempt = await Submission.findOne({
      user: req.user._id, problem: problem._id, _id: { $ne: submission._id },
    });
    if (!prevAttempt) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.attempted': 1 } });
    }

    // Return results (mask hidden test case I/O for wrong answers)
    const publicResults = results.map(r => ({
      ...r,
      input: r.isHidden && status !== 'Accepted' ? '(hidden)' : r.input,
      expectedOutput: r.isHidden && status !== 'Accepted' ? '(hidden)' : r.expectedOutput,
    }));

    res.status(201).json({
      success: true,
      submission: {
        _id: submission._id,
        status,
        runtime,
        passedCount,
        totalCount,
        testResults: publicResults,
        errorMessage: submission.errorMessage,
        createdAt: submission.createdAt,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/submissions/problem/:problemId - user's submissions for a problem
const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
      problem: req.params.problemId,
    })
      .select('-testResults -code')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, submissions });
  } catch (err) { next(err); }
};

// GET /api/submissions/:id - single submission detail
const getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title slug difficulty');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

    // Students can only see own submissions
    if (req.user.role !== 'admin' && String(submission.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, submission });
  } catch (err) { next(err); }
};

// GET /api/submissions/me - all my submissions
const getAllMySubmissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [submissions, total] = await Promise.all([
      Submission.find({ user: req.user._id })
        .populate('problem', 'title slug difficulty category')
        .select('-testResults -code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(parseInt(limit)),
      Submission.countDocuments({ user: req.user._id }),
    ]);
    res.json({ success: true, submissions, total });
  } catch (err) { next(err); }
};

module.exports = { submitSolution, getMySubmissions, getSubmission, getAllMySubmissions };
