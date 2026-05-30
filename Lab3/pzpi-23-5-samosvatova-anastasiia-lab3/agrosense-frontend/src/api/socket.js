import { io } from 'socket.io-client';


export const socket = io('/', {
  autoConnect: false, 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

socket.on('connect', () => {
  console.log('🟢 WebSocket підключено:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔴 WebSocket відключено');
});