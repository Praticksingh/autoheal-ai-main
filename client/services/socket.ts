import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

export const analysisSocket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

export function ensureSocketConnection() {
  if (!analysisSocket.connected) {
    analysisSocket.connect();
  }
}
