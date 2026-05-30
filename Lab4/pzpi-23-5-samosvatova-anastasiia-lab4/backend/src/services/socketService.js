let io;

module.exports = {
    init: (httpServer) => {
        const { Server } = require('socket.io');
        io = new Server(httpServer, {
            cors: {
                origin: "*", // У продакшені замініть на URL вашого фронтенду
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', (socket) => {
            console.log('Клієнт підключився (WebSocket):', socket.id);

            // Клієнт підписується на оновлення конкретної теплиці
            socket.on('join_greenhouse', (greenhouseId) => {
                socket.join(`greenhouse_${greenhouseId}`);
                console.log(`Socket ${socket.id} приєднався до кімнати greenhouse_${greenhouseId}`);
            });

            // Клієнт відписується (наприклад, при виході зі сторінки)
            socket.on('leave_greenhouse', (greenhouseId) => {
                socket.leave(`greenhouse_${greenhouseId}`);
                console.log(`Socket ${socket.id} покинув кімнату greenhouse_${greenhouseId}`);
            });

            socket.on('disconnect', () => {
                console.log('Клієнт відключився:', socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io ще не ініціалізовано!");
        }
        return io;
    }
};