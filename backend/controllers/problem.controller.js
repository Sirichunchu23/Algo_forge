const Problem = require('../models/Problem.model');
const Submission = require('../models/Submission.model');

// GET /api/problems - public list (no hidden test cases)
const getProblems = async (req, res, next) => {
  try {
    const { difficulty, category, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [problems, total] = await Promise.all([
      Problem.find(query)
        .select('-testCases -starterCode.java -description')
        .sort({ order: 1, createdAt: 1 })
        .skip((page - 1) * limit).limit(parseInt(limit)),
      Problem.countDocuments(query),
    ]);

    res.json({ success: true, problems, total, page: parseInt(page) });
  } catch (err) { next(err); }
};

// GET /api/problems/:slug - single problem (no hidden test inputs)
const getProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug, isActive: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });

    // Strip hidden test case inputs from public view
    const pub = problem.toObject();
    pub.testCases = pub.testCases.map(tc =>
      tc.isHidden ? { ...tc, input: '(hidden)', expectedOutput: '(hidden)' } : tc
    );

    res.json({ success: true, problem: pub });
  } catch (err) { next(err); }
};

// GET /api/problems/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Problem.distinct('category', { isActive: true });
    res.json({ success: true, categories });
  } catch (err) { next(err); }
};

module.exports = { getProblems, getProblem, getCategories };
