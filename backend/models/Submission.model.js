const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testCaseIndex: Number,
  input: String,
  expectedOutput: String,
  actualOutput: String,
  passed: Boolean,
  isHidden: Boolean,
  runtime: Number,
  error: String,
});

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: true },
  language: { type: String, enum: ['javascript', 'python', 'java'], required: true },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error', 'Pending'],
    default: 'Pending',
  },
  runtime: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  testResults: [testResultSchema],
  passedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  errorMessage: { type: String, default: '' },
}, { timestamps: true });

submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problem: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
