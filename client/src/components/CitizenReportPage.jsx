import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Ensure the marker fix from IncidentMap is also applied here if needed

// --- Map Click Handler Component ---
const LocationPicker = ({ onLocationChange }) => {
    // State to hold the temporary marker position
    const [position, setPosition] = useState(null);

    // useMapEvents hook is the standard way to handle map events in react-leaflet
    const map = useMapEvents({
        click(e) {
            // Update the local state
            setPosition(e.latlng);
            // Call the parent handler to update the form state
            onLocationChange(e.latlng);
        },
    });

    return position === null ? null : (
        // Render a marker at the clicked location
        <Marker position={position}>
            <Popup>Report Location</Popup>
        </Marker>
    );
};

// --- Citizen Report Page Component ---
const CitizenReportPage = () => {
    // State for the report form data
    const [reportData, setReportData] = useState({
        description: '',
        location: { latitude: null, longitude: null }, // State to store coordinates
    });

    // Handler to update the coordinates state when the map is clicked
    const handleMapClick = useCallback((latlng) => {
        setReportData(prevData => ({
            ...prevData,
            location: {
                latitude: latlng.lat,
                longitude: latlng.lng,
            },
        }));
    }, []);

    // ... other form handlers and submission logic ...

    return (
        <div>
            <h2>Report an Incident</h2>
            <p>Click on the map to select the location of the incident.</p>
            
            <div style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
                <MapContainer 
                    center={[40.7128, -74.0060]} // Default center
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {/* Integrate the click handler component */}
                    <LocationPicker onLocationChange={handleMapClick} />
                </MapContainer>
            </div>

            <form onSubmit={() => { /* Submission Logic Here */ }}>
                <label>
                    Location Coordinates: 
                    ({reportData.location.latitude ? reportData.location.latitude.toFixed(4) : 'N/A'}, 
                     {reportData.location.longitude ? reportData.location.longitude.toFixed(4) : 'N/A'})
                </label>
                {/* ... other form fields ... */}
                <button type="submit" disabled={!reportData.location.latitude}>Submit Report</button>
            </form>
        </div>
    );
};

export default CitizenReportPage;