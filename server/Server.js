import  connectDB from './config/db.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Connect to the database
connectDB();


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}
);



