import { Incident } from '../models/Incident.js';   
import asyncHandler from 'express-async-handler'; // Recommended for error handling

// Temporary placeholder for Socket.io instance
let io;
const setSocketIO = (socketIoInstance) => {
    io = socketIoInstance;
};

// @route   POST /api/incidents
// @desc    Report a new incident (Citizen only)
const reportIncident = asyncHandler(async (req, res) => {
    // Note: GeoJSON coordinates are [longitude, latitude].
    const { coordinates, address } = req.body.location; 

    // req.user.id and req.user.role are set by authMiddleware.protect
    const newIncident = new Incident({
        ...req.body,
        reporter: req.user.id,
        status: 'Reported',
        location: {
            type: 'Point',
            coordinates: coordinates, // Ensure coordinates array [lng, lat] is used
            address: address
        }
    });

    const incident = await newIncident.save();

    // **CRITICAL: Real-Time Alert**
    if (io) {
        // Emit the new incident to all connected Responders/Admins
        io.to('responders').emit('new_incident_alert', incident); 
    }

    res.status(201).json({ msg: 'Incident reported successfully', incident });
});

// @route   GET /api/incidents/unassigned
// @desc    Get all unassigned incidents (Responder/Admin only)
const getUnassignedIncidents = asyncHandler(async (req, res) => {
    // FIX: Filter for both status 'Reported' and assignedTo being null/missing
const { lat, lng, maxDistance = 50000 } = req.query; // maxDistance default is 50km in meters

    let query = { status: 'Reported' }; // Default filter
try {
    if (lat && lng) {
            // Apply MongoDB GeoJSON $near query
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)] // [Longitude, Latitude]
                    },
                    $maxDistance: parseInt(maxDistance) 
                }
            };
            // Note: Your Incident model must have 'location: "2dsphere"' index for this to work.
        }
    const incidents = await Incident.find({ 
            status: 'Reported',
            assignedTo: null // Ensures it hasn't been assigned yet
        })
        .sort({ createdAt: -1 })
        .populate('reporter', 'username email'); // Show reporter info
    
    res.status(200).json(incidents);
} catch (error) {
    console.error('Error fetching incidents with proximity:', error);
        res.status(500).json({ msg: 'Server Error' });
}
    
});

// @route   PUT /api/incidents/:id/status
// @desc    Update incident status (Responder/Admin only)
const updateIncidentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    // Validate status input
    if (!['Assigned', 'InProgress', 'Resolved', 'Rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status update.' });
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        return res.status(404).json({ msg: 'Incident not found' });
    }

    incident.status = status;
    
    // Auto-assign to the Responder making the update if status is 'Assigned' and not already assigned
    if (status === 'Assigned' && !incident.assignedTo) {
         incident.assignedTo = req.user.id;
    }

    await incident.save();

    // **CRITICAL: Real-Time Update**
    if (io) {
        // Broadcast the status change to all relevant users (e.g., all users, or reporter's room)
        io.emit('incident_status_change', { incidentId: incident._id, newStatus: status }); 
    }

    res.status(200).json({ msg: 'Status updated', incident });
});

export {
    reportIncident,
    getUnassignedIncidents,
    updateIncidentStatus,
    setSocketIO
};