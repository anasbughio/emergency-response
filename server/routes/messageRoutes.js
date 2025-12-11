import express from 'express';
const router = express.Router();
import { getMessages } from '../controllers/messageController.js';

// Assuming the middleware folder is named 'middleware'
// 🚨 FIX: Corrected folder path (if it was 'middlewares')
import { protect } from '../middlewares/authMiddleware.js';

// Route to fetch all messages for a specific incident
router.route('/:incidentId').get(protect, getMessages);

export default router;