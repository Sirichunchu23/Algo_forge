const Problem = require('../models/Problem.model');
const { runTestCase } = require('../utils/executor');

// POST /api/execute/run — run code against visible test cases only
const runCode = async (req, res, next) => {
  try {
    const { problemId, code, language, customInput } = req.body;
    if (!problemId || !code || !language)
      return res.status(400).json({ success: false, message: 'problemId, code, and language required.' });

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    if (!code.trim()) return res.status(400).json({ success: false, message: 'Code cannot be empty.' });

    // If custom input provided, run against that
    if (customInput !== undefined && customInput !== '') {
      const { output, error, runtime } = await runTestCase(code, language, problem.functionName, customInput);
      return res.json({
        success: true,
        results: [{
          testCaseIndex: 0,
          input: customInput,
          expectedOutput: '(custom)',
          actualOutput: output,
          passed: null,
          isHidden: false,
          runtime,
          error: error || '',
        }],
      });
    }

    // Run against visible test cases only
    const visibleCases = problem.testCases.filter(tc => !tc.isHidden);
    const results = [];

    for (let i = 0; i < visibleCases.length; i++) {
      const tc = visibleCases[i];
      const { output, error, runtime } = await runTestCase(code, language, problem.functionName, tc.input);
      const actual = (output || '').trim();
      const expected = (tc.expectedOutput || '').trim();

      let passed = false;
      if (!error) {
        try {
          passed = JSON.stringify(JSON.parse(actual)) === JSON.stringify(JSON.parse(expected));
        } catch {
          passed = actual.toLowerCase() === expected.toLowerCase();
        }
      }

      results.push({
        testCaseIndex: i,
        input: tc.input,
        expectedOutput: expected,
        actualOutput: actual,
        passed,
        isHidden: false,
        runtime,
        error: error || '',
      });
    }

    res.json({ success: true, results });
  } catch (err) { next(err); }
};

module.exports = { runCode };
