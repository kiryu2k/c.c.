import { io } from 'socket.io-client';
import config from "../config/config.js";

const options = {
  'force new connection': true,
  reconnectionAttempts: 'Infinity',
  timeout: 10000,
  transports: ['websocket'],
  autoConnect: false,
  path: '/api/signal',
  auth: {
    token: null,
  },
  withCredentials: true,
};

export const socket = io(config.serverUrl, options);

export const connectToWsServer = (token) => {
  console.log('connect to ws server');
  socket.auth.token = token
  socket.off();
  socket.connect();
};
