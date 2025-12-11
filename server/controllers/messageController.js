import asyncHandler from 'express-async-handler';
// 🚨 FIX: Add .js extension and confirm named vs default export
import {Message} from '../models/Message.js'; 
import {Incident} from '../models/Incident.js'; 

/**
 * @desc    Get all messages for a specific incident
 * @route   GET /api/messages/:incidentId
 * @access  Private (Protected route)
 */
const getMessages = asyncHandler(async (req, res) => {
    const { incidentId } = req.params;
    
    // 1. Fetch the Incident to perform authorization
    const incident = await Incident.findById(incidentId);

    if (!incident) {
        res.status(404);
        throw new Error('Incident not found');
    }

    // --- 2. Authorization Check ---
    // Check if the current user (req.user) is an Admin, a Responder, or the Reporter of the incident.
    const reporterId = incident.reporter.toString();
    const currentUserId = req.user._id.toString();

    const isReporter = reporterId === currentUserId;
    
    // 🚨 FIX: Change .includes to check for equality since assignedTo is a single ID
    const isAssignedResponder = incident.assignedTo && incident.assignedTo.toString() === currentUserId;
    
    const isAdmin = req.user.role === 'Admin'; // Assuming user role is stored in req.user

    if (!isAdmin && !isAssignedResponder && !isReporter) {
        res.status(403); // Forbidden
        throw new Error('Not authorized to view messages for this incident');
    }

    // 3. Fetch the Messages
    const messages = await Message.find({ incident: incidentId })
        // Assuming your User model has 'name' and 'role' fields
        .populate('user', 'name role') 
        .sort('createdAt'); // Sort by creation date to show chat history chronologically

    res.status(200).json(messages);
});

// 🚨 FIX: Use ES Module export syntax
export {
    getMessages,
};