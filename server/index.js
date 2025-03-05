const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('../src/constants/actions');

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {}; // Currently using In memory data - may store in DB later

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((clientSocketId)=> {
        return {
            socketId: clientSocketId,
            username: userSocketMap[clientSocketId]
        }
    })
}

io.on('connection', (socket) => {
    socket.on(ACTIONS.JOIN, (data) => {
        const { roomId, username } = data;
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach((client) => {
            // Notify all clients in the room that a new user has joined
            io.to(client.socketId).emit(ACTIONS.JOINED, {
                clients, // Send all connected clients in the room
                username, // Send the username of the new user just joined,
                socketId: socket.id // Send the socket id of the new user just joined
            })
        })
    })

    socket.on(ACTIONS.CODE_CHANGE, (data) => {
        const { roomId, code } = data;
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, (data) => {
        const { socketId, code } = data;
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        // Notify all clients in the room that a user has disconnected
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id] || 'Unknown User'
            })
        })

        delete userSocketMap[socket.id];
        socket.leave();
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})