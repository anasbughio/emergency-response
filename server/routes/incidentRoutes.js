import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
    reportIncident,
    getUnassignedIncidents,
    updateIncidentStatus
} from '../controllers/incidentController.js';  
const router = express.Router();

// 1. REPORT INCIDENT (Protected: ONLY Citizens can report)
router.post('/', protect, authorize('citizen'), reportIncident);

// 2. GET UNASSIGNED (Protected: ONLY Responders/Admins can see this)
router.get('/unassigned', protect, authorize(['responder', 'admin']), getUnassignedIncidents);

// 3. UPDATE STATUS (Protected: ONLY Responders/Admins can change status)
router.put('/:id/status', protect, authorize(['responder', 'admin']), updateIncidentStatus);

export default router;