const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
});

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  examples: [exampleSchema],
  constraints: [{ type: String }],
  starterCode: {
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
    java: { type: String, default: '' },
  },
  testCases: [testCaseSchema],
  functionName: { type: String, required: true },
  inputFormat: { type: String, default: '' },
  tags: [{ type: String }],
  acceptanceRate: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

problemSchema.index({ slug: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ category: 1 });

module.exports = mongoose.model('Problem', problemSchema);
