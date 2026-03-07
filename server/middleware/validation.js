const REPO_URL_REGEX = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/i;
const RUN_ID_REGEX = /^[a-zA-Z0-9_-]{1,100}$/;

function createValidationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitizeString(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function validateAnalyzeRepoRequest(req, res, next) {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const repoUrl = sanitizeString(payload.repoUrl);
    const teamName = sanitizeString(payload.teamName);
    const leaderName = sanitizeString(payload.leaderName);
    const mode = sanitizeString(payload.mode).toLowerCase();
    const runId = payload.runId ? sanitizeString(payload.runId) : undefined;

    if (!repoUrl || !REPO_URL_REGEX.test(repoUrl)) {
      throw createValidationError('Invalid GitHub repository URL');
    }

    if (!teamName) {
      throw createValidationError('teamName is required');
    }

    if (!leaderName) {
      throw createValidationError('leaderName is required');
    }

    if (mode !== 'individual' && mode !== 'team') {
      throw createValidationError('mode must be either individual or team');
    }

    if (runId && !RUN_ID_REGEX.test(runId)) {
      throw createValidationError('Invalid runId format');
    }

    req.body = {
      repoUrl,
      teamName,
      leaderName,
      mode,
      ...(runId ? { runId } : {}),
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

function validateHistoryQuery(req, res, next) {
  try {
    const rawLimit = req.query.limit;
    const parsed = Number(rawLimit ?? 20);

    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100) {
      throw createValidationError('limit must be a number between 1 and 100');
    }

    req.query.limit = String(Math.trunc(parsed));
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  validateAnalyzeRepoRequest,
  validateHistoryQuery,
};
