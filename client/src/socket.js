import { io } from 'socket.io-client';

const socket = io('https://ride-sharing-tracker-backend.onrender.com', {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export default socket;