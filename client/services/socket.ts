import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';

const isProduction = import.meta.env.PROD;
const isSocketConfigured = Boolean(SOCKET_URL && SOCKET_URL.trim() && (!isProduction || import.meta.env.VITE_SOCKET_URL));

export const analysisSocket: Socket = io(SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false,
  reconnection: isSocketConfigured,
  reconnectionAttempts: 3,
  timeout: 5000,
  transports: ['websocket', 'polling'],
});

export function ensureSocketConnection() {
  if (isSocketConfigured && !analysisSocket.connected) {
    try {
      analysisSocket.connect();
    } catch (err) {
      console.warn('Socket.IO connection skipped:', err);
    }
  }
}
