import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';
import authService from '../services/authService';
import { useAuth } from './AuthContext.jsx';

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        // Username validation
        if (fullName.length < 3 || fullName.length > 30) {
            newErrors.fullName = "Username must be between 3 and 30 characters.";
        } else if (!/^[a-zA-Z0-9_]+$/.test(fullName)) {
            newErrors.fullName = "Username can only contain letters, numbers, and underscores.";
        }

        // Password complexity validation
        if (password.length < 8 || password.length > 50) {
            newErrors.password = "Password must be between 8 and 50 characters.";
        } else {
            if (!/[A-Z]/.test(password)) newErrors.password = "Password needs an uppercase letter.";
            if (!/[a-z]/.test(password)) newErrors.password = "Password needs a lowercase letter.";
            if (!/[0-9]/.test(password)) newErrors.password = "Password needs a number.";
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) newErrors.password = "Password needs a special character.";
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await authService.signup(fullName, email, password, confirmPassword);
            navigate('/login', { state: { message: "Signup successful! Please log in." } });
        } catch (error) {
            const apiError = error.response?.data?.detail || "An unexpected error occurred.";
            // Handle specific API validation errors from Pydantic
            if (Array.isArray(apiError)) {
                const newApiErrors = {};
                apiError.forEach(err => {
                    // Map backend field names to frontend state names
                    const fieldName = err.loc && err.loc.length > 1 ? (err.loc[1] === 'full_name' ? 'fullName' : err.loc[1]) : 'form';
                    newApiErrors[fieldName] = err.msg;
                });
                setErrors(newApiErrors);
            } else {
                setErrors({ form: apiError });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>WELCOME</h1>
                    <h2>Join AI Mock Interview</h2>
                    <p>Start your journey towards smart interview preparation powered by AI insights.</p>
                </div>
            </div>
            <div className="form-section">
                <h1>Create Account</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    {errors.form && <p className="error-message">{errors.form}</p>}
                    
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input 
                            id="fullName"
                            type="text" 
                            className="form-control" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            onBlur={validate} 
                            required 
                            placeholder="Enter your full name"
                        />
                        {errors.fullName && <p className="error-message">{errors.fullName}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            className="form-control" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            onBlur={validate} 
                            required 
                            placeholder="Enter your email address"
                        />
                        {errors.email && <p className="error-message">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password" 
                            type="password" 
                            className="form-control" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            onBlur={validate} 
                            required 
                            placeholder="Create a strong password"
                        />
                        {errors.password && <p className="error-message">{errors.password}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                            id="confirmPassword"
                            type="password" 
                            className="form-control" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            onBlur={validate} 
                            required 
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                    </div>

                    <button type="submit" className="btn-auth btn-primary-auth" disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>

                    <p className="auth-footer-text">Already have an account? <Link to="/login">Login</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Signup;