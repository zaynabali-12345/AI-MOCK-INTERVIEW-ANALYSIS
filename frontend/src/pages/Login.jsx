import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';
import { useAuth } from './AuthContext.jsx'; // Corrected path

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // For regular login
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/dashboard'); // Or wherever you want to redirect after login
        } catch (error) {
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.detail) ||
                error.message ||
                error.toString();
            
            setLoading(false);
            setMessage(resMessage);
        }
    };

    return (
        <div className="auth-container">
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>WELCOME</h1>
                    <h2>Sign In to Your Account</h2>
                    <p>Access your personalized interview preparation and insights.</p>
                </div>
            </div>
            <div className="form-section">
                <h1>Login</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username or Email</label>
                        <input 
                            id="username" 
                            type="text" 
                            className="form-control" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            placeholder="Enter your username or email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password" 
                            type="password" 
                            className="form-control" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    {message && <p className="error-message">{message}</p>}

                    <button type="submit" className="btn-auth btn-primary-auth" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p className="auth-footer-text">Don't have an account? <Link to="/signup">Sign Up</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Login;