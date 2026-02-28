const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: true, credentials: true }
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/', (req, res) => res.json({ message: '🏠 RoomiE API is running!' }));

// Socket.io — Real-time chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) onlineUsers.set(userId, socket.id);

    socket.on('sendMessage', ({ receiverId, message }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveMessage', message);
        }
    });

    socket.on('disconnect', () => {
        onlineUsers.forEach((id, key) => {
            if (id === socket.id) onlineUsers.delete(key);
        });
    });
});

// Start server immediately so Railway healthcheck passes
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Connect to MongoDB async
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB error:', err));
