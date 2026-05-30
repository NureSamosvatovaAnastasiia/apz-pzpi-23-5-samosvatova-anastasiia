require('dotenv').config();
const http = require('http'); // Додано для WebSocket
const app = require('./app');
const socketService = require('./services/socketService'); // Додано підключення сервісу

const PORT = process.env.PORT || 3000;

// Створюємо HTTP сервер на базі Express додатку
const server = http.createServer(app);

// Ініціалізуємо WebSocket, передаючи йому HTTP сервер
socketService.init(server);

// Запускаємо саме SERVER, а не APP!
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Docs: http://localhost:${PORT}/api-docs`);
  console.log(`WebSocket server is active!`);
});