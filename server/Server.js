import connectDB from './config/db.js';
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from "http"; 
import { Server } from "socket.io"; 
// Assuming you have a Message model and controllers for the chat feature
import {Message} from './models/Message.js'; 
import messageRoutes from './routes/messageRoutes.js';
import * as incidentController from './controllers/incidentController.js';
import incidentRoutes from './routes/incidentRoutes.js';

dotenv.config();

const ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:5173'];
const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST']
    }
});

// Pass the Socket.io instance to the incident controller (for incident update alerts)
incidentController.setSocketIO(io);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allows requests from specified origins or without an origin (like Postman or server-side requests)
        if (ALLOWED_ORIGINS.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true 
}));
app.use(express.json()); // Correct placement: before routes that use JSON bodies
app.use(cookieParser());

// Connect to the database
connectDB(); // Assuming this is defined in ./config/db.js

// --- Define API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes); 
// 🚨 FIX: Add the Message Routes
app.use('/api/messages', messageRoutes); 

// --- SOCKET.IO CONNECTION & REAL-TIME LOGIC ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Existing: Join general role rooms (for initial incident alerts)
    socket.on('join_role_room', (role) => {
        if (role === 'responder' || role === 'admin') {
            socket.join('responders');
            console.log(`User ${socket.id} joined responders room.`);
        }
    });

    // 1. New Event: Join Incident Chat Room (for targeted messaging)
    socket.on('join_incident_room', (incidentId) => {
        socket.join(incidentId);
        console.log(`User ${socket.id} joined chat room: ${incidentId}`);
    });

    // 2. New Event: Handle Incoming Message
    socket.on('send_message', async ({ incidentId, userId, content, username, role }) => {
        try {
            // Save message to MongoDB
            const newMessage = new Message({
                incident: incidentId,
                user: userId,
                content: content
            });
            await newMessage.save();

            // Prepare payload for all users in the chat room
            const messagePayload = {
                incidentId,
                user: { _id: userId, username, role }, 
                content,
                createdAt: newMessage.createdAt
            };

            // Emit message to everyone in the specific incident room
            io.to(incidentId).emit('new_message', messagePayload);
        } catch (error) {
            console.error('Error saving or sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
// ---------------------------------------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});