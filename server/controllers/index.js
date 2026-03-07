const logger = require('../utils/logger');
const {
  validateRepository,
  cloneRepository,
  analyzeProjectStructure,
  runTests,
  analyzeBugs,
  calculateScore,
  createAnalysisRun,
  getRunHistory,
} = require('../services');
const { emitAnalysisEvent } = require('../socket');

async function analyzeRepoController(req, res, next) {
  try {
    const { repoUrl, teamName, leaderName, mode, runId: providedRunId } = req.body || {};
    const runId = providedRunId || `run-${Date.now()}`;

    if (!repoUrl) {
      return res.status(400).json({ message: 'repoUrl is required' });
    }

    console.log('Received repository:', repoUrl);
    logger.log('analysis_request_received', { repoUrl, teamName, leaderName, mode, runId });

    logger.log('repository_received', { repoUrl, runId });
    emitAnalysisEvent('analysis_started', { runId, repoUrl });

    const startTime = Date.now();
    console.log('Validating repository...');
    await validateRepository(repoUrl);

    console.log('Cloning repository...');
    const repoPath = await cloneRepository(repoUrl, runId);
    emitAnalysisEvent('repo_cloned', { runId, repoUrl });

    const structure = await analyzeProjectStructure(repoPath);
    emitAnalysisEvent('tests_running', { runId, repoUrl, testFiles: structure.testFiles.length });

    console.log('Running tests...');
    const testResult = await runTests(repoPath);
    console.log('Analyzing failures...');
    const bugAnalysis = analyzeBugs(testResult, structure.testFiles);

    if (bugAnalysis.bugsFound > 0) {
      emitAnalysisEvent('bug_detected', {
        runId,
        repoUrl,
        bugsFound: bugAnalysis.bugsFound,
        failures: bugAnalysis.failures,
      });
    }

    console.log('Generating fixes...');
    emitAnalysisEvent('fix_applied', {
      runId,
      repoUrl,
      bugsFixed: bugAnalysis.bugsFixed,
    });

    const analysisTime = Date.now() - startTime;
    const score = calculateScore({
      bugsFound: bugAnalysis.bugsFound,
      bugsFixed: bugAnalysis.bugsFixed,
      analysisTime,
    });

    const runRecord = await createAnalysisRun({
      repoUrl,
      bugsFound: bugAnalysis.bugsFound,
      bugsFixed: bugAnalysis.bugsFixed,
      score,
      analysisTime,
      createdAt: new Date(),
    });

    const timeline = [
      { step: 'Repository validation', status: 'success', timestamp: new Date().toISOString() },
      { step: 'Repository clone', status: 'success', timestamp: new Date().toISOString() },
      { step: 'Test execution', status: testResult.passed || testResult.skipped ? 'success' : 'failed', timestamp: new Date().toISOString() },
      { step: 'Bug analysis', status: 'success', timestamp: new Date().toISOString() },
      { step: 'Score calculation', status: 'success', timestamp: new Date().toISOString() },
    ];

    emitAnalysisEvent('pipeline_complete', {
      runId,
      repoUrl,
      bugsFound: bugAnalysis.bugsFound,
      bugsFixed: bugAnalysis.bugsFixed,
      score,
      analysisTime,
    });

    const result = {
      success: true,
      runId,
      bugsFound: bugAnalysis.bugsFound,
      fixesApplied: bugAnalysis.bugsFixed,
      bugs: bugAnalysis,
      score,
      analysisTime,
      timeline,
      run: runRecord,
      structure,
      tests: testResult,
    };

    console.log('Analysis result:', {
      runId,
      bugsFound: result.bugsFound,
      fixesApplied: result.fixesApplied,
      score: result.score,
    });
    logger.log('analysis_completed', {
      runId,
      repoUrl,
      teamName,
      leaderName,
      mode,
      bugsFound: result.bugsFound,
      fixesApplied: result.fixesApplied,
      score: result.score,
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.log('analysis_failed', { error, body: req.body }, 'error');

    const statusCode = Number(error.statusCode || error.status || 500);
    return res.status(statusCode).json({
      success: false,
      error: 'analysis_failed',
      message: error.message || 'Analysis failed unexpectedly',
    });
  }
}

function getHealthController(req, res) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}

async function getHistoryController(req, res, next) {
  try {
    const history = await getRunHistory({ limit: req.query.limit });
    return res.status(200).json({
      count: history.length,
      runs: history,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  analyzeRepoController,
  getHealthController,
  getHistoryController,
};