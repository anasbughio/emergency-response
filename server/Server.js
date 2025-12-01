import  connectDB from './config/db.js';
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
dotenv.config();
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}
);



