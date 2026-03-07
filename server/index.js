const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware');

function createApp() {
  const app = express();
  const clientOrigin = process.env.CLIENT_ORIGIN || '*';

  app.use(cors({ origin: clientOrigin }));
  app.use(express.json());

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;