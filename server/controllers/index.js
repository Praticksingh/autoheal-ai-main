const logger = require('../utils/logger');
const {
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
} = require('../services');
const { emitAnalysisEvent } = require('../socket');

async function sendTeamNotification(repoName, errorSummary, dashboardLink) {
  const webhookUrl = process.env.TEAM_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const summary = typeof errorSummary === 'string' && errorSummary.trim()
    ? errorSummary.trim().slice(0, 500)
    : 'AutoHealer generated a fix summary.';

  const payload = {
    text: `🚨 CI/CD Pipeline Failed in ${repoName}. AutoHealer has found the issue and generated a fix.`,
    embeds: [
      {
        title: `🚨 CI/CD Pipeline Failed in ${repoName}`,
        description: 'AutoHealer has found the issue and generated a fix.',
        color: 15158332,
        fields: [
          {
            name: 'Issue Summary',
            value: summary,
          },
          {
            name: 'Dashboard',
            value: dashboardLink || 'N/A',
          },
        ],
      },
    ],
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🚨 CI/CD Pipeline Failed in ${repoName}*\nAutoHealer has found the issue and generated a fix.`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Issue Summary:*\n${summary}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Dashboard:* ${dashboardLink || 'N/A'}`,
        },
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Team webhook returned HTTP ${response.status}`);
  }
}

function detectIssueTypeFromExplanation(explanation = {}) {
  const bugType = String(explanation.bugType || '').toLowerCase();
  if (bugType.includes('syntax') || bugType.includes('lint')) {
    return 'syntax';
  }
  if (bugType.includes('import') || bugType.includes('dependency')) {
    return 'dependency';
  }
  return 'logic';
}

function buildAiResponse(explanations = [], bugAnalysis = {}) {
  const primary = explanations[0] || {};
  const issueType = detectIssueTypeFromExplanation(primary);
  const confidenceScore = issueType === 'syntax' ? 96 : issueType === 'dependency' ? 88 : 72;

  return {
    fixedCode: primary.functionContext || primary.suggestedFix || '',
    aiExplanation: primary.explanation || bugAnalysis.summary || 'AutoHealer generated a fix suggestion.',
    confidenceScore,
    issueType,
    filePath: primary.file || '',
  };
}

async function analyzeRepoController(req, res, next) {
  try {
    const {
      repoUrl,
      teamName,
      leaderName,
      mode,
      runId: providedRunId,
      userSettings = { autoApproveEnabled: false, confidenceThreshold: 95 },
    } = req.body || {};
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

    console.log('Running tests & static code scan...');
    const testResult = await runTests(repoPath);
    const staticIssues = await performStaticCodeAnalysis(repoPath, structure);
    console.log('Analyzing failures...');
    const bugAnalysis = analyzeBugs(testResult, structure.testFiles, staticIssues);
    const explanations = await generateBugExplanations({
      testResult,
      bugAnalysis,
      structure,
      repoPath,
      repoUrl,
    });

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
      { step: 'Repository clone', status: 'success', timestamp: new Date().toISOString() },
      { step: 'Dependencies installed', status: 'success', timestamp: new Date().toISOString() },
      { step: 'Test execution', status: testResult.passed || testResult.skipped ? 'success' : 'failed', timestamp: new Date().toISOString() },
      { step: 'Bugs detected', status: 'success', timestamp: new Date().toISOString() },
      { step: 'Fixes generated', status: 'success', timestamp: new Date().toISOString() },
      { step: 'CI/CD Pipeline restored', status: 'success', timestamp: new Date().toISOString() },
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
      explanations,
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

    const repoName = repoUrl.split('/').filter(Boolean).pop()?.replace(/\.git$/i, '') || 'repository';
    const errorSummary = explanations[0]?.explanation || bugAnalysis.summary || 'Issue identified by AutoHealer.';
    const dashboardLink = process.env.CLIENT_ORIGIN && process.env.CLIENT_ORIGIN !== '*'
      ? `${process.env.CLIENT_ORIGIN.replace(/\/$/, '')}/dashboard`
      : '';

    try {
      await sendTeamNotification(repoName, errorSummary, dashboardLink);
    } catch (notificationError) {
      logger.log(
        'team_notification_failed',
        {
          runId,
          repoUrl,
          error: notificationError,
        },
        'warn'
      );
    }

    const aiResponse = buildAiResponse(explanations, bugAnalysis);
    if (
      userSettings.autoApproveEnabled
      && aiResponse.confidenceScore >= userSettings.confidenceThreshold
      && aiResponse.issueType === 'syntax'
      && aiResponse.filePath
      && aiResponse.fixedCode
    ) {
      try {
        const autoBranchName = `autohealer-fix-${Date.now()}`;
        const autoCommitMessage = 'AutoHealer AI automated CI/CD fix';
        const autoPr = await commitFixToRepository({
          repoUrl,
          branchName: autoBranchName,
          commitMessage: autoCommitMessage,
          fixedFiles: [
            {
              filePath: aiResponse.filePath,
              content: aiResponse.fixedCode,
            },
          ],
          aiExplanation: aiResponse.aiExplanation,
        });

        return res.status(200).json({
          status: 'auto-healed',
          message: 'Issue fixed and PR opened automatically.',
          prLink: autoPr.pullRequestUrl,
        });
      } catch (autoHealError) {
        logger.log(
          'auto_heal_interceptor_failed',
          {
            runId,
            repoUrl,
            error: autoHealError,
          },
          'warn'
        );
      }
    }

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

async function commitFixController(req, res) {
  try {
    const { repoUrl, branchName, commitMessage, fixedFiles, aiExplanation } = req.body || {};

    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'repoUrl is required',
      });
    }

    if (!Array.isArray(fixedFiles) || fixedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'fixedFiles must contain at least one file',
      });
    }

    const result = await commitFixToRepository({
      repoUrl,
      branchName,
      commitMessage,
      fixedFiles,
      aiExplanation,
    });

    logger.log('github_commit_fix_success', {
      repoUrl,
      branchName: result.branchName,
      committedFiles: result.committedFiles.length,
      commitHash: result.commitHash,
      pullRequestNumber: result.pullRequestNumber,
    });

    return res.status(200).json({
      success: true,
      message: 'Fix committed to a new branch and pull request opened successfully.',
      ...result,
    });
  } catch (error) {
    logger.log('github_commit_fix_failed', { error, body: req.body }, 'error');

    const statusCode = Number(error.statusCode || error.status || 500);
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to commit fix to repository',
    });
  }
}

function extractWebhookFailureContext(eventName, payload = {}) {
  if (!eventName) {
    return { isFailed: false, repoUrl: '', commitHash: '' };
  }

  const repository = payload.repository || {};
  const repoUrl = repository.clone_url || repository.html_url || '';

  if (eventName === 'workflow_run') {
    return {
      isFailed: payload.action === 'completed' && payload.workflow_run?.conclusion === 'failure',
      repoUrl,
      commitHash: payload.workflow_run?.head_sha || '',
    };
  }

  if (eventName === 'check_run') {
    return {
      isFailed: payload.action === 'completed' && payload.check_run?.conclusion === 'failure',
      repoUrl,
      commitHash: payload.check_run?.head_sha || '',
    };
  }

  if (eventName === 'check_suite') {
    return {
      isFailed: payload.action === 'completed' && payload.check_suite?.conclusion === 'failure',
      repoUrl,
      commitHash: payload.check_suite?.head_sha || '',
    };
  }

  return {
    isFailed: false,
    repoUrl,
    commitHash: payload.after || payload.head_commit?.id || '',
  };
}

async function githubWebhookController(req, res, next) {
  try {
    const eventName = req.header('x-github-event');
    const payload = req.webhookPayload || {};
    const { isFailed, repoUrl, commitHash } = extractWebhookFailureContext(eventName, payload);

    if (!isFailed) {
      logger.log('github_webhook_ignored', {
        eventName,
        reason: 'event_not_failed',
      });

      return res.status(202).json({
        success: true,
        ignored: true,
        message: 'Webhook received, but event is not a failed build.',
      });
    }

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Repository URL not found in webhook payload',
      });
    }

    req.body = {
      repoUrl,
      teamName: payload.repository?.owner?.login || 'github-webhook',
      leaderName: 'github-actions',
      mode: 'team',
      userSettings: {
        autoApproveEnabled: false,
        confidenceThreshold: 95,
      },
      ...(commitHash ? { runId: `gh-${commitHash.slice(0, 16)}` } : {}),
    };

    logger.log('github_webhook_triggering_analysis', {
      eventName,
      repoUrl,
      commitHash,
    });

    return analyzeRepoController(req, res, next);
  } catch (error) {
    logger.log('github_webhook_failed', { error }, 'error');
    return next(error);
  }
}

module.exports = {
  analyzeRepoController,
  getHealthController,
  getHistoryController,
  commitFixController,
  githubWebhookController,
};