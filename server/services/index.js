const { validateRepository } = require('./githubService');
const { cloneRepository } = require('./repoCloneService');
const { analyzeProjectStructure } = require('./analysisService');
const { runTests } = require('./testRunnerService');
const { analyzeBugs } = require('./bugAnalysisService');
const { calculateScore } = require('./scoringService');
const { createAnalysisRun, getRunHistory } = require('./runService');

module.exports = {
  validateRepository,
  cloneRepository,
  analyzeProjectStructure,
  runTests,
  analyzeBugs,
  calculateScore,
  createAnalysisRun,
  getRunHistory,
};