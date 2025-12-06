import {Incident} from '../models/Incident.js';   
           

// Temporary placeholder for Socket.io instance
let io;
const setSocketIO = (socketIoInstance) => {
    io = socketIoInstance;
};

// @route   POST /api/incidents
// @desc    Report a new incident (Citizen only)
const reportIncident = async (req, res) => {
    try {
        // req.user.id and req.user.role are set by authMiddleware.protect
        const newIncident = new Incident({
            ...req.body,
            reporter: req.user.id,
            status: 'Reported'
        });

        const incident = await newIncident.save();

        // **CRITICAL: Real-Time Alert**
        if (io) {
            // Emit the new incident to all connected Responders/Admins
            io.to('responders').emit('new_incident_alert', incident); 
        }

        res.status(201).json({ msg: 'Incident reported successfully', incident });
    } catch (error) {
        console.error('Error reporting incident:', error);
        res.status(500).json({ msg: 'Server Error', details: error.message });
    }
};

// @route   GET /api/incidents/unassigned
// @desc    Get all unassigned incidents (Responder/Admin only)
const getUnassignedIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find({ status: 'Reported' })
            .sort({ createdAt: -1 })
            .populate('reporter', 'username email'); // Show reporter info
        
        res.status(200).json(incidents);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error', details: error.message });
    }
};

// @route   PUT /api/incidents/:id/status
// @desc    Update incident status (Responder/Admin only)
const updateIncidentStatus = async (req, res) => {
    const { status, assignedTo } = req.body;
    
    // Validate status input (optional: use Joi validation here as well)
    if (!['Assigned', 'InProgress', 'Resolved', 'Rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status update.' });
    }

    try {
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({ msg: 'Incident not found' });
        }

        incident.status = status;
        
        // Auto-assign to the Responder making the update if status is 'Assigned'
        if (status === 'Assigned' && !incident.assignedTo) {
             incident.assignedTo = req.user.id;
        }

        await incident.save();

        // **CRITICAL: Real-Time Update**
        if (io) {
            // Notify the reporter about the status change
            // (You'd ideally use a room dedicated to the incident ID for targeted messaging)
            io.emit('incident_status_change', { incidentId: incident._id, newStatus: status }); 
        }

        res.status(200).json({ msg: 'Status updated', incident });
    } catch (error) {
        res.status(500).json({ msg: 'Server Error', details: error.message });
    }
};

export {
    reportIncident,
    getUnassignedIncidents,
    updateIncidentStatus,
    setSocketIO
};