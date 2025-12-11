import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import the provider
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenReportPage from './pages/CitizenReportPage'; // For 'citizen' role
import ResponderDashboard from './pages/ResponderDashboard'; // For 'responder' role
import ProtectedRoute from './components/ProtectedRoute'; // Component for role-based protection
import Layout from './components/Layout'; // Simple wrapper for Navbar/Footer
import IncidentDetails from './components/IncidentDetails'; // New page for incident details
import 'leaflet/dist/leaflet.css';
function App() {
    return (
        <Router>
            <AuthProvider> 
                <Layout>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route path="/" element={<LoginPage />} /> {/* Default route */}

                        {/* Protected Citizen Routes */}
                        <Route 
                            path="/report" 
                            element={
                                <ProtectedRoute allowedRoles={['citizen']}>
                                    <CitizenReportPage />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Protected Responder/Admin Routes */}
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute allowedRoles={['responder', 'admin']}>
                                    <ResponderDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/incident/:incidentId" // <-- Note the dynamic parameter
                            element={
                                <ProtectedRoute allowedRoles={['responder', 'admin']}>
                                    {/* 3. Render a wrapper page that fetches the specific incident data */}
                                    <IncidentDetails /> 
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* 404/Catch-all page goes here */}
                        <Route path="*" element={<h2>404 Not Found</h2>} />
                    </Routes>
                </Layout>
            </AuthProvider>
        </Router>
    );
}

export default App;