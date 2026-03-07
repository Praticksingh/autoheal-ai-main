const http = require('http');
require('dotenv').config();
const createApp = require('./index');
const logger = require('./utils/logger');
const { connectDatabase } = require('./config/database');
const { initSocket } = require('./socket');

const app = createApp();
const defaultPort = Number(process.env.PORT || 5000);

function startServerWithPortRetry(initialPort) {
  const tryListen = (portToTry) => {
    const server = http.createServer(app);

    const onError = (error) => {
      if (error && error.code === 'EADDRINUSE') {
        logger.log('port_in_use_retrying', { port: portToTry, nextPort: portToTry + 1 }, 'warn');
        return tryListen(portToTry + 1);
      }

      logger.log('server_start_failed', { error }, 'error');
    };

    server.once('error', onError);

    server.listen(portToTry, () => {
      server.off('error', onError);
      initSocket(server);
      console.log(`AutoHealer AI backend running on http://localhost:${portToTry}`);
      logger.log('server_started', {
        port: portToTry,
        url: `http://localhost:${portToTry}`,
      });
    });
  };

  tryListen(initialPort);
}

connectDatabase().finally(() => {
  startServerWithPortRetry(defaultPort);
});
