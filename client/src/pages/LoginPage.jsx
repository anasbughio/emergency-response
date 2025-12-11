import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            // The login function makes the API call and sets the global state
            const role = await login(email, password); 

            // Redirection based on the role received from the backend
            if (role === 'citizen') {
                navigate('/report');
            } else if (role === 'responder' || role === 'admin') {
                navigate('/dashboard');
            }
        } catch (err) {
            // Handle validation errors from Joi (Status 400) or Invalid Credentials (Status 401)
            const errorMsg = err.response?.data?.msg || 'Login failed. Please try again.';
            setError(errorMsg);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc' }}>
            <h2>Login to Emergency Platform</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <br /><br />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <br /><br />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
    );
};

export default LoginPage;