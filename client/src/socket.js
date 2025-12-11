import { io } from 'socket.io-client';

// Use the VITE environment variable for the backend URL
const URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

// CRITICAL: Create the socket instance
export const socket = io(URL, {
    // Optional: Add transport options if needed
    autoConnect: false, // Prevents auto connection until we explicitly call socket.connect()
    withCredentials: true, // If your socket connection also requires cookies
});

// For simplicity in the hackathon, you can change autoConnect to true.
// const socket = io(URL);
// export { socket };