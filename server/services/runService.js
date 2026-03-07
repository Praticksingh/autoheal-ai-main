const { AnalysisRun } = require('../models');
const { isDatabaseConnected } = require('../config/database');
const logger = require('../utils/logger');

async function createAnalysisRun(data) {
  if (!isDatabaseConnected()) {
    logger.log('analysis_run_persist_skipped', { reason: 'database_not_connected' }, 'warn');
    return null;
  }

  return AnalysisRun.create(data);
}

async function getRunHistory({ limit = 20 }) {
  if (!isDatabaseConnected()) {
    return [];
  }

  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return AnalysisRun.find({}).sort({ createdAt: -1 }).limit(parsedLimit);
}

module.exports = {
  createAnalysisRun,
  getRunHistory,
};
