const mongoose = require('mongoose');

const analysisRunSchema = new mongoose.Schema(
  {
    repoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    bugsFound: {
      type: Number,
      required: true,
      min: 0,
    },
    bugsFixed: {
      type: Number,
      required: true,
      min: 0,
    },
    score: {
      type: Number,
      required: true,
    },
    analysisTime: {
      type: Number,
      required: true,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('AnalysisRun', analysisRunSchema);
