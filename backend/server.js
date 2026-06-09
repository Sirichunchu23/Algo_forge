const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const problemRoutes = require('./routes/problem.routes');
const submissionRoutes = require('./routes/submission.routes');
const adminRoutes = require('./routes/admin.routes');
const executeRoutes = require('./routes/execute.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/execute', executeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AlgoForge API running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    //await seedAdmin();
    await seedProblems();
    app.listen(PORT, () => {
      console.log(`🚀 AlgoForge API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

 async function seedAdmin() {
  try {
    const User = require('./models/User.model');
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@algoforge.dev';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
      await User.create({
        username: process.env.ADMIN_USERNAME || 'algoforge_admin',
        email: adminEmail,
        password: hashed,
        role: 'admin',
      });
      console.log(`🔑 Admin seeded: ${adminEmail}`);
    }
  } catch (e) {
    console.error('Admin seed error:', e.message);
  }
}

async function seedProblems() {
  try {
    const Problem = require('./models/Problem.model');
    const count = await Problem.countDocuments();
    if (count > 0) return;

    const problems = [
      {
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        category: 'Array',
        description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
        examples: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
          { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: '' },
        ],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
};`,
          python: `def twoSum(nums, target):
    # Your code here
    pass`,
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
        },
        testCases: [
          { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
          { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
          { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true },
          { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', isHidden: true },
        ],
        functionName: 'twoSum',
        inputFormat: 'array\nnumber',
        tags: ['array', 'hash-table'],
        acceptanceRate: 49,
      },
      {
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        difficulty: 'Easy',
        category: 'Stack',
        description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        examples: [
          { input: 's = "()"', output: 'true', explanation: '' },
          { input: 's = "()[]{}"', output: 'true', explanation: '' },
          { input: 's = "(]"', output: 'false', explanation: '' },
        ],
        constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \'()[]{}\'.'],
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your code here
};`,
          python: `def isValid(s):
    # Your code here
    pass`,
          java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: '()', expectedOutput: 'true', isHidden: false },
          { input: '()[]{}', expectedOutput: 'true', isHidden: false },
          { input: '(]', expectedOutput: 'false', isHidden: false },
          { input: '([)]', expectedOutput: 'false', isHidden: true },
          { input: '{[]}', expectedOutput: 'true', isHidden: true },
        ],
        functionName: 'isValid',
        inputFormat: 'string',
        tags: ['string', 'stack'],
        acceptanceRate: 40,
      },
      {
        title: 'Reverse Linked List',
        slug: 'reverse-linked-list',
        difficulty: 'Easy',
        category: 'Linked List',
        description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.`,
        examples: [
          { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: '' },
          { input: 'head = [1,2]', output: '[2,1]', explanation: '' },
          { input: 'head = []', output: '[]', explanation: '' },
        ],
        constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
        starterCode: {
          javascript: `/**
 * @param {number[]} head - represented as array for this platform
 * @return {number[]}
 */
function reverseList(head) {
  // Your code here
};`,
          python: `def reverseList(head):
    # head is represented as array for this platform
    pass`,
          java: `class Solution {
    public int[] reverseList(int[] head) {
        // Your code here
        return new int[]{};
    }
}`,
        },
        testCases: [
          { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
          { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false },
          { input: '[]', expectedOutput: '[]', isHidden: true },
          { input: '[1]', expectedOutput: '[1]', isHidden: true },
        ],
        functionName: 'reverseList',
        inputFormat: 'array',
        tags: ['linked-list', 'recursion'],
        acceptanceRate: 73,
      },
      {
        title: 'Maximum Subarray',
        slug: 'maximum-subarray',
        difficulty: 'Medium',
        category: 'Dynamic Programming',
        description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.`,
        examples: [
          { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
          { input: 'nums = [1]', output: '1', explanation: '' },
          { input: 'nums = [5,4,-1,7,8]', output: '23', explanation: '' },
        ],
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Your code here
};`,
          python: `def maxSubArray(nums):
    # Your code here
    pass`,
          java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
          { input: '[1]', expectedOutput: '1', isHidden: false },
          { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: false },
          { input: '[-1]', expectedOutput: '-1', isHidden: true },
          { input: '[-2,-1]', expectedOutput: '-1', isHidden: true },
        ],
        functionName: 'maxSubArray',
        inputFormat: 'array',
        tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
        acceptanceRate: 50,
      },
      {
        title: 'Climbing Stairs',
        slug: 'climbing-stairs',
        difficulty: 'Easy',
        category: 'Dynamic Programming',
        description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
        examples: [
          { input: 'n = 2', output: '2', explanation: 'There are two ways: 1 step + 1 step, 2 steps' },
          { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
        ],
        constraints: ['1 <= n <= 45'],
        starterCode: {
          javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Your code here
};`,
          python: `def climbStairs(n):
    # Your code here
    pass`,
          java: `class Solution {
    public int climbStairs(int n) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: '2', expectedOutput: '2', isHidden: false },
          { input: '3', expectedOutput: '3', isHidden: false },
          { input: '1', expectedOutput: '1', isHidden: true },
          { input: '10', expectedOutput: '89', isHidden: true },
          { input: '45', expectedOutput: '1836311903', isHidden: true },
        ],
        functionName: 'climbStairs',
        inputFormat: 'number',
        tags: ['math', 'dynamic-programming', 'memoization'],
        acceptanceRate: 51,
      },
      {
        title: 'Binary Search',
        slug: 'binary-search',
        difficulty: 'Easy',
        category: 'Binary Search',
        description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
        examples: [
          { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' },
          { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1' },
        ],
        constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All the integers in nums are unique.', 'nums is sorted in ascending order.'],
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Your code here
};`,
          python: `def search(nums, target):
    # Your code here
    pass`,
          java: `class Solution {
    public int search(int[] nums, int target) {
        // Your code here
        return -1;
    }
}`,
        },
        testCases: [
          { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
          { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false },
          { input: '[5]\n5', expectedOutput: '0', isHidden: true },
          { input: '[1,2,3,4,5]\n1', expectedOutput: '0', isHidden: true },
        ],
        functionName: 'search',
        inputFormat: 'array\nnumber',
        tags: ['array', 'binary-search'],
        acceptanceRate: 55,
      },
    ];

    await Problem.insertMany(problems);
    console.log(`📚 Seeded ${problems.length} problems`);
  } catch (e) {
    console.error('Problem seed error:', e.message);
  }
}

module.exports = app;