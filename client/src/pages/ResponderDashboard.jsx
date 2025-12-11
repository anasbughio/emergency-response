import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
// import io from 'socket.io-client'; // Socket.io Client
import IncidentMap from '../components/IncidentMap';
import { Link } from 'react-router-dom';
// const socket = io(import.meta.env.VITE_API_BASE_URL.replace('/api', ''));
import { socket } from '../socket.js';
const ResponderDashboard = () => {
    const { user } = useAuth();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    // 1. Fetch initial list of incidents
    const fetchIncidents = async () => {
        try {

            let url = '/incidents/unassigned';

    if (userLocation && userLocation.lat !== null) {
        // Append location query parameters
        url += `?lat=${userLocation.lat}&lng=${userLocation.lng}&maxDistance=50000`; 
    }
            // Securely fetches unassigned incidents using the HTTP-only cookie
            const res = await api.get(url); 
            setIncidents(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch incidents:", error);
            setLoading(false);
        }
    };
   // 2. Geolocation useEffect (Runs ONLY once on mount to get location)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (err) => {
                    console.warn(`Geolocation error (${err.code}): ${err.message}`);
                    // Fallback location
                    setUserLocation({ lat: 31.5497, lng: 74.3436 }); 
                }
            );
        } else {
            // No geolocation support: set fallback immediately
            setUserLocation({ lat: 31.5497, lng: 74.3436 }); 
        }
        // Note: No dependency array needed if we want it to run just once.
        // If you were previously using a dependency array that included 'user', you should split the effects.
    }, []);
    
    // 2. Setup Socket.io client and listeners
    // 3. Data Fetching and Socket Setup useEffect (Runs when user and userLocation are ready)
    useEffect(() => {
        // Only run the fetching and socket logic once the user and location data are ready
        if (user && userLocation) {
            // Fetch incidents using the location data
            fetchIncidents(); 
            
            // A. Join the 'responders' room
            if (user.role === 'responder' || user.role === 'admin') {
                socket.emit('join_role_room', user.role);
            }

            // B & C. Socket Listeners for new incidents and status changes
            socket.on('new_incident_alert', (newIncident) => {
                // If using Geo-Search, you may want to check if newIncident is within the 50km radius 
                // before adding it to the list, or rely on the backend filter.
                setIncidents(prev => [newIncident, ...prev]); 
            });

            socket.on('incident_status_change', ({ incidentId, newStatus }) => {
                 setIncidents(prev => 
                    prev.map(inc => inc._id === incidentId ? { ...inc, status: newStatus } : inc)
                 );
            });

            // Clean up socket listeners on component unmount
            return () => {
                socket.off('new_incident_alert');
                socket.off('incident_status_change');
            };
        }
    }, [user, userLocation]);

    // 3. Status Update Handler
    const handleStatusUpdate = async (incidentId, newStatus) => {
        try {
            // Securely updates status using the HTTP-only cookie
            await api.put(`/incidents/${incidentId}/status`, { status: newStatus });
            
            // The status update should trigger the socket listener ('incident_status_change') 
            // to update the state, making a local state update redundant but fast.
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    if (loading || userLocation === null) {
    // If loading is true OR location hasn't been set yet (even to fallback)
    return <div>Getting Location and Loading Dashboard...</div>;
}

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '50px auto' }}>
            <h2>Responder Dashboard ({user.role} View)</h2>
            <p>Welcome, {user.username}. There are {incidents.length} unassigned or active incidents.</p>
<div style={{ marginBottom: '30px' }}>
    {userLocation && <IncidentMap incidents={incidents} userLocation={userLocation} />}
</div>
            {incidents.map((incident) => (
                <Link 
        key={incident._id} 
        to={`/incident/${incident._id}`} // Directs to /incident/657d0f...
        style={{ textDecoration: 'none', color: 'inherit' }} // Remove link styles
    >
                <div key={incident._id} style={{ border: `1px solid ${incident.status === 'Reported' ? 'red' : 'green'}`, padding: '15px', marginBottom: '10px' }}>
                    <h4>{incident.title} (Severity: {incident.severity})</h4>
                    <p>Status: <strong>{incident.status}</strong></p>
                    <p>Reported by: {incident.reporter.username} ({new Date(incident.createdAt).toLocaleTimeString()})</p>
                    <p>Location: {incident.location.coordinates.join(', ')}</p>
                    
                    {/* Status Update Buttons */}
                    {incident.status === 'Reported' && (
                        <button onClick={() => handleStatusUpdate(incident._id, 'Assigned')}>Assign to Me</button>
                    )}
                    {incident.status === 'Assigned' && (
                        <button onClick={() => handleStatusUpdate(incident._id, 'InProgress')}>Start Work</button>
                    )}
                    {incident.status === 'InProgress' && (
                        <button onClick={() => handleStatusUpdate(incident._id, 'Resolved')}>Resolve Incident</button>
                    )}
                </div>
                </Link>
            ))}
            {incidents.length === 0 && <p>No active incidents at this time. Great job!</p>}
        </div>
    );
};

export default ResponderDashboard;