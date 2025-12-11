import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Your configured Axios instance

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
       
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 

        try {
            // Note: Registration is a public route, but the response sets the HTTP-only cookie.
            const res = await api.post('/auth/register', formData); 
            
            // Backend should return Status 201 on success.
            console.log("Registration successful! User role:", res.data.user.role);

            // Redirect the new user to the login page
            navigate('/login'); 

        } catch (err) {
            // Handle Joi validation errors (400) or user already exists (400)
            const errorMsg = err.response?.data?.details?.join(', ') || err.response?.data?.msg || 'Registration failed.';
            setError(errorMsg);
            console.error("Registration error:", err);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc' }}>
            <h2>Register for Emergency Platform</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                <br /><br />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <br /><br />
                <input type="password" name="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={handleChange} required />
                <br /><br />
            
                <br /><br />
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
    );
};

export default RegisterPage;