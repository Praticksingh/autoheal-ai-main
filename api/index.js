const createApp = require('../server/index');
const { connectDatabase } = require('../server/config/database');

const app = createApp();

module.exports = async (req, res) => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('Failed to connect to database in Vercel function:', error);
  }
  return app(req, res);
};
