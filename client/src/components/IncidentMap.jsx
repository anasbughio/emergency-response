import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Helper component to recenter the map when userLocation changes
// This uses the useMap hook, which must be a direct child of MapContainer
const ChangeMapView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

/**
 * Renders a map showing markers for a list of incidents, centered on the user's location.
 * * @param {object} userLocation - { lat: number, lng: number }
 * @param {array} incidents - Array of incident objects
 */
const IncidentMap = ({ incidents = [], userLocation }) => {
    
    // Default fallback center (used only if userLocation is null)
    const defaultCenter = [31.5497, 74.3436]; 

    // Determine the map center: [Latitude, Longitude]
    const mapCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : defaultCenter; 

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <MapContainer 
                center={mapCenter} // Use the center derived from userLocation
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                {/* Component to dynamically update center/zoom */}
                <ChangeMapView center={mapCenter} zoom={13} />
                
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Marker for the Responder's Location (Optional, for clarity) */}
                {userLocation && (
                    <Marker position={mapCenter}>
                        <Popup>Your Current Location</Popup>
                    </Marker>
                )}

                {/* Iterate over incidents and render a Marker for each */}
                {incidents.map(incident => {
                    // CRITICAL FIX: Extract GeoJSON coordinates [lng, lat]
                    const coordinates = incident.location?.coordinates;
                    
                    // Safety check for bad data
                    if (!coordinates || coordinates.length !== 2) {
                        return null;
                    }
                    
                    // Leaflet requires [Latitude, Longitude]. GeoJSON provides [Longitude, Latitude].
                    const [lng, lat] = coordinates; 
                    
                    return (
                        <Marker 
                            key={incident._id} 
                            position={[lat, lng]} // FLIPPED: [Latitude, Longitude]
                        >
                            <Popup>
                                <strong>{incident.title || 'Incident'}</strong><br />
                                Status: {incident.status} <br />
                                Severity: {incident.severity} <br />
                                Location: {lat.toFixed(3)}, {lng.toFixed(3)}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default IncidentMap;