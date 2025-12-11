import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios'; // Your configured Axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Function to handle login (sends request and updates state)
    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            
            // Backend sends user data (including role) in the JSON body,
            // while the token is set automatically as an HTTP-only cookie.
            setUser(res.data.user);
            setIsAuthenticated(true);
            
            return res.data.user.role; // Return role for redirection
        } catch (error) {
            setIsAuthenticated(false);
            throw error; // Let the component handle error messages
        }
    };

    // Function to handle logout
    const logout = async () => {
        try {
            await api.get('/auth/logout'); // Clears the HTTP-only cookie
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout failed:", error);
            // Even if the request fails, clear local state for safety
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        // OPTIONAL: A function to check session status on component mount 
        // (usually by hitting a protected route like /api/me)
        setLoading(false); 
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);