const { validateRepository } = require('./githubService');
const { cloneRepository } = require('./repoCloneService');
const { analyzeProjectStructure, performStaticCodeAnalysis } = require('./analysisService');
const { runTests } = require('./testRunnerService');
const { analyzeBugs } = require('./bugAnalysisService');
const { generateBugExplanations } = require('./bugExplanationService');
const { calculateScore } = require('./scoringService');
const { createAnalysisRun, getRunHistory } = require('./runService');
const { commitFixToRepository } = require('./githubCommitService');

module.exports = {
  validateRepository,
  cloneRepository,
  analyzeProjectStructure,
  performStaticCodeAnalysis,
  runTests,
  analyzeBugs,
  generateBugExplanations,
  calculateScore,
  createAnalysisRun,
  getRunHistory,
  commitFixToRepository,
};