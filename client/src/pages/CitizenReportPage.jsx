import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
// Note: You may need a component here to get the user's current GPS location

const CitizenReportPage = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        // Initialize location data (coordinates: [lng, lat])
        coordinates: [0, 0], 
        severity: 'Medium'
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationChange = (e) => {
        // Simple string parsing for hackathon (e.g., "10.0, 20.0")
        const [lng, lat] = e.target.value.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lng) && !isNaN(lat)) {
            setFormData({ ...formData, coordinates: [lng, lat] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Prepare the payload for the secure POST /api/incidents route
        const payload = {
            title: formData.title,
            description: formData.description,
            severity: formData.severity,
            location: {
                type: 'Point',
                coordinates: formData.coordinates,
                // In a real app, you'd reverse geocode coordinates to get the address
            }
        };

        try {
            const res = await api.post('/incidents', payload);
            setMessage(`Success! Incident ID ${res.data.incident._id} reported. Responders have been notified.`);
            setFormData({ title: '', description: '', coordinates: [0, 0], severity: 'Medium' }); // Reset form

        } catch (err) {
            console.error("Report failed:", err.response?.data);
            setMessage(`Error reporting incident: ${err.response?.data?.msg || 'Check console.'}`);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '50px auto' }}>
            <h2>Report a New Incident (Citizen View)</h2>
            <p>Welcome, {user.username}. Use this form to report an emergency.</p>

            <form onSubmit={handleSubmit}>
                {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
                
                {/* Title */}
                <input type="text" name="title" placeholder="Short Title (e.g., House Fire)" value={formData.title} onChange={handleChange} required />
                <br /><br />
                
                {/* Description */}
                <textarea name="description" placeholder="Detailed description of the incident..." value={formData.description} onChange={handleChange} rows="5" required />
                <br /><br />
                
                {/* Location Input (simplified) */}
                <label>Location (Lng, Lat): </label>
                <input type="text" placeholder="e.g., 74.3, 31.5" onChange={handleLocationChange} required />
                <br /><br />
                
                {/* Severity */}
                <label>Severity: </label>
                <select name="severity" value={formData.severity} onChange={handleChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
                <br /><br />
                
                <button type="submit">Submit Report</button>
            </form>
        </div>
    );
};

export default CitizenReportPage;