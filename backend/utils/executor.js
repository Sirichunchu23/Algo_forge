/**
 * Code Execution Engine
 * - Primary: Built-in JavaScript VM sandbox (for dev / JS submissions)
 * - Secondary: Judge0 CE API (for multi-language, production)
 */
const vm = require('vm');

// Judge0 language IDs
const JUDGE0_LANG_IDS = {
  javascript: 63,  // Node.js 12.14.0
  python: 71,      // Python 3.8.1
  java: 62,        // Java OpenJDK 13.0.1
};

/**
 * Wrap user code so the function is called with parsed test input
 */
function buildJSRunner(userCode, functionName, inputLines) {
  const inputParsers = inputLines.map((line, i) => {
    line = line.trim();
    if (line.startsWith('[') || line.startsWith('{')) {
      return `const _arg${i} = JSON.parse(${JSON.stringify(line)});`;
    }
    if (line === 'true') return `const _arg${i} = true;`;
    if (line === 'false') return `const _arg${i} = false;`;
    if (!isNaN(line)) return `const _arg${i} = Number(${JSON.stringify(line)});`;
    return `const _arg${i} = ${JSON.stringify(line)};`;
  });

  const argList = inputLines.map((_, i) => `_arg${i}`).join(', ');

  return `
${userCode}

(function() {
  ${inputParsers.join('\n  ')}
  const __result = ${functionName}(${argList});
  if (typeof __result === 'boolean') return String(__result);
  if (Array.isArray(__result)) return JSON.stringify(__result);
  if (__result === null || __result === undefined) return 'null';
  return String(__result);
})()
`;
}

/**
 * Normalise output for comparison
 */
function normalise(output) {
  if (!output) return '';
  let s = String(output).trim();
  // Normalise JSON arrays/objects
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) {
      // Sort for unordered comparisons where needed
      return JSON.stringify(parsed);
    }
    return JSON.stringify(parsed);
  } catch {
    return s.toLowerCase();
  }
}

/**
 * Run JS code in a sandboxed VM (built-in executor)
 */
function runJS(code, timeoutMs = 5000) {
  const sandbox = {
    console: { log: () => {}, error: () => {} },
    Math, JSON, Array, Object, String, Number, Boolean, RegExp,
    parseInt, parseFloat, isNaN, isFinite,
    Map, Set, WeakMap, WeakSet,
    Promise,
  };
  try {
    const result = vm.runInNewContext(code, sandbox, { timeout: timeoutMs });
    return { output: String(result ?? ''), error: null };
  } catch (err) {
    if (err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
      return { output: '', error: 'Time Limit Exceeded' };
    }
    return { output: '', error: err.message };
  }
}

/**
 * Execute via Judge0 API
 */
async function runViaJudge0(code, language, stdin) {
  const axios = require('axios');
  const base = process.env.JUDGE0_URL;
  const langId = JUDGE0_LANG_IDS[language];

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.JUDGE0_API_KEY) {
    headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }

  const submitRes = await axios.post(
    `${base}/submissions?base64_encoded=false&wait=true`,
    { source_code: code, language_id: langId, stdin },
    { headers, timeout: 15000 }
  );

  const { stdout, stderr, compile_output, status, time, memory } = submitRes.data;
  const output = (stdout || '').trim();
  const error = compile_output || stderr || null;
  const statusName = status?.description || 'Unknown';

  return { output, error, statusName, runtime: parseFloat(time) * 1000 || 0, memory: memory || 0 };
}

/**
 * Run a single test case
 */
async function runTestCase(userCode, language, functionName, testInput, timeoutMs = 5000) {
  const start = Date.now();

  try {
    // Use Judge0 if configured and language is not JS, or forced
    if (process.env.JUDGE0_URL && process.env.USE_BUILTIN_EXECUTOR !== 'true') {
      const result = await runViaJudge0(userCode, language, testInput);
      return {
        output: result.output,
        error: result.error,
        runtime: result.runtime || (Date.now() - start),
        statusName: result.statusName,
      };
    }

    // Built-in JS executor (JavaScript only in this mode)
    if (language !== 'javascript') {
      return {
        output: '',
        error: 'Multi-language execution requires Judge0. Configure JUDGE0_URL in .env to enable Python and Java.',
        runtime: 0,
      };
    }

    const inputLines = testInput.split('\n').filter(l => l.trim() !== '');
    const runner = buildJSRunner(userCode, functionName, inputLines);
    const result = runJS(runner, timeoutMs);

    return {
      output: result.output,
      error: result.error,
      runtime: Date.now() - start,
    };
  } catch (err) {
    return { output: '', error: err.message, runtime: Date.now() - start };
  }
}

/**
 * Run all test cases for a submission
 */
async function executeSubmission(userCode, language, functionName, testCases) {
  const results = [];
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const { output, error, runtime } = await runTestCase(userCode, language, functionName, tc.input);

    const actualOutput = (output || '').trim();
    const expectedOutput = (tc.expectedOutput || '').trim();
    const passed = !error && normalise(actualOutput) === normalise(expectedOutput);

    if (passed) passedCount++;

    results.push({
      testCaseIndex: i,
      input: tc.input,
      expectedOutput,
      actualOutput,
      passed,
      isHidden: tc.isHidden,
      runtime,
      error: error || '',
    });
  }

  const allPassed = passedCount === testCases.length;
  const anyError = results.find(r => r.error);
  let status = 'Wrong Answer';
  if (allPassed) status = 'Accepted';
  else if (anyError?.error === 'Time Limit Exceeded') status = 'Time Limit Exceeded';
  else if (anyError?.error) {
    status = anyError.error.includes('SyntaxError') ? 'Compilation Error' : 'Runtime Error';
  }

  const avgRuntime = Math.round(results.reduce((s, r) => s + (r.runtime || 0), 0) / results.length);

  return { results, status, passedCount, totalCount: testCases.length, runtime: avgRuntime };
}

module.exports = { runTestCase, executeSubmission };
