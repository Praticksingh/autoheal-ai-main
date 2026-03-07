const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    logger.log('db_connection_skipped', { reason: 'MongoDB URI not set — running without database.' }, 'warn');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.log('db_connected', { provider: 'mongodb' });
    return true;
  } catch (error) {
    logger.log('db_connection_failed', { error }, 'error');
    return false;
  }
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  isDatabaseConnected,
};
