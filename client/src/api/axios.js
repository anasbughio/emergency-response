// api.js (or axios.js)
import axios from 'axios';

// NOTE: Use VITE_ prefix for Vite environment variables
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, 
    withCredentials: true,
});

export default api;