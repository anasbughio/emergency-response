import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// New function to set the cookie and send the response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id, user.role);

    // Configuration for the HTTP-only cookie
    const options = {
        // 12 hours expiry (Matches the hardcoded time in your existing options)
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000), 
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Use 'true' in production (HTTPS)
        sameSite: 'Lax' // Recommended for security
    };

    // Send the cookie and the user data (without the token in the body)
    res.status(statusCode)
        .cookie('token', token, options) // Set the HTTP-only cookie
        .json({
            success: true,
            user: { 
                id: user._id, 
                username: user.username,
                role: user.role // Respond with the role
            } 
        });
};

// @route   POST /api/auth/register
// @desc    Register a new user
const registerUser = async (req, res, next) => {
    const { username, email, password, role } = req.body;

    try {
        // 1. Create the user
        // Note: You should ensure your Mongoose User model hashes the password 
        // using a 'pre-save' hook.
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role // Assuming 'role' is passed in the request body for setup
        });
        
        // 2. Use the helper to send the cookie and response
        sendTokenResponse(user, 201, res);
        
    } catch (error) {
        // Handle validation or duplicate key errors
        res.status(400).json({ success: false, error: error.message });
        // Optionally use 'next(error)' if you have a centralized error handler
    }
};

// @route   POST /api/auth/login
// @desc    Log in a user
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            error: 'Please provide an email and password' 
        });
    }

    try {
        // 2. Find user by email and select the password hash
        // We use select('+password') because typically 'password' is excluded by default in the model schema
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // 3. Check if password matches
        // Assuming your User model has a method to compare passwords (e.g., user.matchPassword)
        // If not, you can use bcrypt.compare(password, user.password) directly.
        // For this example, we'll use a standard bcrypt compare:
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        // 4. Use the helper to send the cookie and response
        // IMPORTANT: We need to create a new object without the password field before sending the response
        // Your User model should prevent the password from being serialized in the JSON response, 
        // but it's safe to ensure here. 
        // Since 'sendTokenResponse' only uses '_id', 'username', and 'role', it's inherently safe.
        sendTokenResponse(user, 200, res);

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        // Optionally use 'next(error)'
    }
};

// @route   GET /api/auth/logout
// @desc    Clear cookie and log user out
const logoutUser = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // Clears quickly
        httpOnly: true
    });
    res.status(200).json({ success: true, msg: 'User logged out' });
};

export { registerUser, loginUser, logoutUser };