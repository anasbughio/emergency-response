import mongoose from 'mongoose';
const IncidentSchema = new mongoose.Schema({
    // Core report details
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true
    },
    // Status for responder workflow
    status: {
        type: String,
        enum: ['Reported', 'Assigned', 'InProgress', 'Resolved', 'Rejected'],
        default: 'Reported'
    },
    // Location data
    location: {
        type: {
            type: String,
            enum: ['Point'], // GeoJSON type
            default: 'Point'
        },
        coordinates: { // [longitude, latitude]
            type: [Number],
            required: true
        },
        address: String // Optional human-readable address
    },
    // Links to the User model
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Must link to a logged-in user (Citizen)
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Links to a Responder, null if not yet assigned
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a geospatial index for efficient location-based queries
IncidentSchema.index({ location: '2dsphere' });

const Incident = mongoose.model('Incident', IncidentSchema);
export { Incident };
