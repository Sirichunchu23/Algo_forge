const Problem = require('../models/Problem.model');
const User = require('../models/User.model');
const Submission = require('../models/Submission.model');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProblems, totalSubmissions, acceptedSubs, recentSubs] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Problem.countDocuments({ isActive: true }),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'Accepted' }),
      Submission.find().populate('user', 'username').populate('problem', 'title slug difficulty')
        .sort({ createdAt: -1 }).limit(10).select('-code -testResults'),
    ]);

    const diffStats = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalProblems, totalSubmissions, acceptedSubs, recentSubs, diffStats },
    });
  } catch (err) { next(err); }
};

// GET /api/admin/problems - all problems with full test cases
const getProblems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };

    const [problems, total] = await Promise.all([
      Problem.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
      Problem.countDocuments(query),
    ]);
    res.json({ success: true, problems, total });
  } catch (err) { next(err); }
};

// GET /api/admin/problems/:id - single problem with full details
const getProblemAdmin = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    res.json({ success: true, problem });
  } catch (err) { next(err); }
};

// POST /api/admin/problems - create problem
const createProblem = async (req, res, next) => {
  try {
    const {
      title, difficulty, category, description, examples, constraints,
      starterCode, testCases, functionName, inputFormat, tags,
    } = req.body;

    if (!title || !difficulty || !category || !description || !functionName)
      return res.status(400).json({ success: false, message: 'Missing required fields.' });

    if (!testCases || testCases.length < 1)
      return res.status(400).json({ success: false, message: 'At least one test case required.' });

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await Problem.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const problem = await Problem.create({
      title, slug: finalSlug, difficulty, category, description,
      examples: examples || [],
      constraints: constraints || [],
      starterCode: starterCode || {},
      testCases: testCases || [],
      functionName,
      inputFormat: inputFormat || '',
      tags: tags || [],
    });

    res.status(201).json({ success: true, message: 'Problem created!', problem });
  } catch (err) { next(err); }
};

// PUT /api/admin/problems/:id - update problem
const updateProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    res.json({ success: true, message: 'Problem updated!', problem });
  } catch (err) { next(err); }
};

// DELETE /api/admin/problems/:id
const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    res.json({ success: true, message: 'Problem deleted.' });
  } catch (err) { next(err); }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'student' };
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);
    res.json({ success: true, users, total });
  } catch (err) { next(err); }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated.' });
  } catch (err) { next(err); }
};

// GET /api/admin/submissions
const getAllSubmissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, userId, problemId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    if (problemId) query.problem = problemId;

    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .populate('user', 'username email')
        .populate('problem', 'title slug difficulty')
        .select('-testResults -code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(parseInt(limit)),
      Submission.countDocuments(query),
    ]);
    res.json({ success: true, submissions, total });
  } catch (err) { next(err); }
};

module.exports = { getStats, getProblems, getProblemAdmin, createProblem, updateProblem, deleteProblem, getUsers, deleteUser, getAllSubmissions };
