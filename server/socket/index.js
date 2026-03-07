const { Server } = require('socket.io');
const logger = require('../utils/logger');

let ioInstance = null;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.on('connection', (socket) => {
    logger.log('socket_connected', { socketId: socket.id });

    socket.on('disconnect', () => {
      logger.log('socket_disconnected', { socketId: socket.id });
    });
  });

  return ioInstance;
}

function emitAnalysisEvent(eventName, payload) {
  if (!ioInstance) {
    return;
  }

  ioInstance.emit(eventName, payload);
}

module.exports = {
  initSocket,
  emitAnalysisEvent,
};
