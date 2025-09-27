#!/usr/bin/env node

/**
 * Wormhole Timer - WebRTC Signaling Server
 * Node.js server with Socket.IO for reliable WebRTC signaling
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Store active rooms and connections
const rooms = new Map();
const connections = new Map();

// Room management
class Room {
    constructor(id) {
        this.id = id;
        this.connections = new Set();
        this.createdAt = Date.now();
    }
    
    addConnection(socketId) {
        this.connections.add(socketId);
    }
    
    removeConnection(socketId) {
        this.connections.delete(socketId);
    }
    
    isEmpty() {
        return this.connections.size === 0;
    }
    
    getConnectionCount() {
        return this.connections.size;
    }
}

// Connection management
class Connection {
    constructor(socketId, roomId, isInitiator = false) {
        this.socketId = socketId;
        this.roomId = roomId;
        this.isInitiator = isInitiator;
        this.connectedAt = Date.now();
        this.lastActivity = Date.now();
    }
    
    updateActivity() {
        this.lastActivity = Date.now();
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Join room
    socket.on('join-room', (data) => {
        const { roomId, isInitiator } = data;
        console.log(`Socket ${socket.id} joining room ${roomId} as ${isInitiator ? 'initiator' : 'responder'}`);
        
        // Create room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Room(roomId));
        }
        
        const room = rooms.get(roomId);
        room.addConnection(socket.id);
        
        // Store connection info
        connections.set(socket.id, new Connection(socket.id, roomId, isInitiator));
        
        // Join socket.io room
        socket.join(roomId);
        
        // Notify room about new connection
        socket.to(roomId).emit('peer-joined', {
            socketId: socket.id,
            isInitiator: isInitiator,
            roomSize: room.getConnectionCount()
        });
        
        // Send current room state to new connection
        socket.emit('room-state', {
            roomId: roomId,
            isInitiator: isInitiator,
            roomSize: room.getConnectionCount(),
            connections: Array.from(room.connections)
        });
        
        console.log(`Room ${roomId} now has ${room.getConnectionCount()} connections`);
    });
    
    // WebRTC signaling
    socket.on('webrtc-signal', (data) => {
        const connection = connections.get(socket.id);
        if (!connection) {
            console.error(`No connection found for socket ${socket.id}`);
            return;
        }
        
        connection.updateActivity();
        
        // Forward signal to other peers in the room
        socket.to(connection.roomId).emit('webrtc-signal', {
            from: socket.id,
            signal: data.signal,
            type: data.type,
            timestamp: Date.now()
        });
        
        console.log(`Signal ${data.type} from ${socket.id} to room ${connection.roomId}`);
    });
    
    // Remote control commands
    socket.on('remote-command', (data) => {
        const connection = connections.get(socket.id);
        if (!connection) {
            console.error(`No connection found for socket ${socket.id}`);
            return;
        }
        
        connection.updateActivity();
        
        // Forward command to initiator (launchpad)
        const room = rooms.get(connection.roomId);
        const initiatorSocket = Array.from(room.connections).find(socketId => {
            const conn = connections.get(socketId);
            return conn && conn.isInitiator;
        });
        
        if (initiatorSocket) {
            io.to(initiatorSocket).emit('remote-command', {
                command: data.command,
                overlay: data.overlay,
                from: socket.id,
                timestamp: Date.now()
            });
            console.log(`Remote command ${data.command} from ${socket.id} to initiator ${initiatorSocket}`);
        } else {
            console.error(`No initiator found in room ${connection.roomId}`);
        }
    });
    
    // Heartbeat/ping
    socket.on('ping', () => {
        const connection = connections.get(socket.id);
        if (connection) {
            connection.updateActivity();
        }
        socket.emit('pong', { timestamp: Date.now() });
    });
    
    // Disconnect handling
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        const connection = connections.get(socket.id);
        if (connection) {
            const room = rooms.get(connection.roomId);
            if (room) {
                room.removeConnection(socket.id);
                
                // Notify other peers
                socket.to(connection.roomId).emit('peer-left', {
                    socketId: socket.id,
                    roomSize: room.getConnectionCount()
                });
                
                // Clean up empty rooms
                if (room.isEmpty()) {
                    rooms.delete(connection.roomId);
                    console.log(`Room ${connection.roomId} deleted (empty)`);
                } else {
                    console.log(`Room ${connection.roomId} now has ${room.getConnectionCount()} connections`);
                }
            }
            
            connections.delete(socket.id);
        }
    });
    
    // Error handling
    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

// API endpoints
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        timestamp: Date.now(),
        rooms: rooms.size,
        connections: connections.size,
        uptime: process.uptime()
    });
});

app.get('/api/rooms', (req, res) => {
    const roomList = Array.from(rooms.entries()).map(([id, room]) => ({
        id: id,
        connections: room.getConnectionCount(),
        createdAt: room.createdAt
    }));
    
    res.json({
        rooms: roomList,
        total: rooms.size
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: Date.now() });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/launchpad', (req, res) => {
    res.sendFile(path.join(__dirname, 'launchpad.html'));
});

app.get('/remote-control', (req, res) => {
    res.sendFile(path.join(__dirname, 'remote-control.html'));
});

// Cleanup inactive connections every 5 minutes
setInterval(() => {
    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [socketId, connection] of connections.entries()) {
        if (now - connection.lastActivity > inactiveThreshold) {
            console.log(`Cleaning up inactive connection: ${socketId}`);
            const socket = io.sockets.sockets.get(socketId);
            if (socket) {
                socket.disconnect(true);
            }
        }
    }
}, 5 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`🚀 Wormhole Signaling Server running on http://${HOST}:${PORT}`);
    console.log(`📊 Status: http://${HOST}:${PORT}/api/status`);
    console.log(`🏠 Launchpad: http://${HOST}:${PORT}/launchpad`);
    console.log(`📱 Remote Control: http://${HOST}:${PORT}/remote-control`);
});
