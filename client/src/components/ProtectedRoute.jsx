import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Access the global auth state

/**
 * Component to protect routes based on authentication status and user role.
 * @param {Array<string>} allowedRoles - The roles permitted to access this route (e.g., ['responder', 'admin']).
 * @param {React.ReactNode} children - The component to render if authorized.
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    
    // 1. Show loading state while checking status
    if (loading) {
        return <div>Loading...</div>; // Replace with a proper spinner
    }

    // 2. If not authenticated (no valid cookie/session)
    if (!isAuthenticated || !user) {
        // Redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // 3. Check if the user's role is included in the allowedRoles array
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.warn(`Access denied for role: ${user.role}. Redirecting.`);
        // Redirect unauthorized users to a general safe page or an access denied page
        // Based on your Emergency Platform design, citizens should go to report
        if (user.role === 'citizen') {
             return <Navigate to="/report" replace />;
        }
        // Redirect others to a generic forbidden page
        return <div>Access Forbidden (403)</div>; 
    }

    // 4. If authenticated and authorized, render the child component
    return children ? children : <Outlet />;
};

export default ProtectedRoute;