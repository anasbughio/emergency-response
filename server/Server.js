import  connectDB from './config/db.js';
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
dotenv.config();
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from "http"; // Import HTTP module
// Import the Incident Controller to set the io instance
import * as incidentController from './controllers/incidentController.js';
import  { Server } from "socket.io" // Import Socket.io Server

// Import Incident Routes
import incidentRoutes from './routes/incidentRoutes.js';


const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.io
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Allow React client connection
        methods: ['GET', 'POST']
    }
});

// Pass the Socket.io instance to the controller
incidentController.setSocketIO(io);
// Middleware 
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your React client URL
    credentials: true // CRITICAL: Allows the browser to send/receive cookies
})); 
app.use(express.json());
app.use(cookieParser()); // Initialize cookie-parser middleware
// Connect to the database
connectDB();

app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/incidents', incidentRoutes); // Add Incident Routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}
);



