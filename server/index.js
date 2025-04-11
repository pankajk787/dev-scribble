const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const ACTIONS = require('../src/constants/actions');

app.use(express.json());
app.use(cors()); // TODO: DO proper CORS setup

app.use(express.static(path.join(__dirname, '../build')));
const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {}; // TODO: Currently using In memory data - may store in DB later
const roomCreatorMap = {}; // TODO: Currently using In memory data - may store in DB later

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
        if(!roomCreatorMap[roomId]) {
            roomCreatorMap[roomId] = socket.id;
            io.to(socket.id).emit(ACTIONS.SELF_JOINED, { isCreator: true });
        }
        else {
            io.to(socket.id).emit(ACTIONS.SELF_JOINED, { isCreator: false });
        }

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
        const { roomId, code, language } = data;
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code, language });
    });

    socket.on(ACTIONS.SYNC_CODE, (data) => {
        const { socketId, code, language } = data;
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code, language, isCodeSync: true });
    });

    socket.on(ACTIONS.CANVAS_CHANGE, (data) => {
        const { roomId, canvasContent, senderId } = data;
        io.to(roomId).emit(ACTIONS.CANVAS_CHANGE, { canvasContent, senderId });
    });

    socket.on(ACTIONS.SYNC_CANVAS_CONTENT, (data) => {
        const { socketId, canvasContent, senderId } = data;
        io.to(socketId).emit(ACTIONS.CANVAS_CHANGE, { canvasContent, senderId, isCanvasSync: true });
    });

    socket.on(ACTIONS.SEND_MESSAGE, (data) => {
        const { roomId } = data;
        const clients = getAllConnectedClients(roomId);
        clients.forEach((client) => {
            if (client.socketId !== socket.id) {
                io.to(client.socketId).emit(ACTIONS.RECIEVED_MESSAGE, data)
            }
        })
    })

    socket.on(ACTIONS.VOICE_CHAT_INITIATE, ({ to }) => {
        io.to(to).emit(ACTIONS.VOICE_CHAT_INITIATE, {
            peerSocketId: socket.id,
        });
    });
    
    // Relay OFFER
    socket.on(ACTIONS.OFFER, ({ to, offer }) => {
        io.to(to).emit(ACTIONS.OFFER, {
            from: socket.id,
            offer,
        });
    });

    // Relay ANSWER
    socket.on(ACTIONS.ANSWER, ({ to, answer }) => {
        io.to(to).emit(ACTIONS.ANSWER, {
            from: socket.id,
            answer,
        });
    });

    // Relay ICE CANDIDATE
    socket.on(ACTIONS.ICE_CANDIDATE, ({ to, candidate }) => {
        io.to(to).emit(ACTIONS.ICE_CANDIDATE, {
            from: socket.id,
            candidate,
        });
    });


    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        // Notify all clients in the room that a user has disconnected
        rooms.forEach((roomId) => {
            let createrDisConnection = false;
            if(roomCreatorMap[roomId] === socket.id) {
                createrDisConnection = true;
                delete roomCreatorMap[roomId];
            }
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id] || 'Unknown User',
                isCreator: createrDisConnection // sent whether creator of the room has disconnected
            })
        })

        delete userSocketMap[socket.id];
        socket.leave();
    });
});

// http routes
app.get('/health', (req, res) => {
    res.json({ healthy: true, status: "ok" });
})

app.get('/get-self', (req, res) => {
    const { socket_id, room_id } = req.query;
    if(socket_id && room_id) {
        const username = userSocketMap[socket_id];
        if(!username) return res.status(404).json({ message: 'Invalid request' })
        if(!roomCreatorMap[room_id]) return res.status(400).json({ message: 'Invalid request' })
        const is_creator = roomCreatorMap[room_id] === socket_id;
        return res.json({ username, is_creator, socket_id, room_id })
    }
    return res.status(400).json({ message: 'Invalid request' })
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})