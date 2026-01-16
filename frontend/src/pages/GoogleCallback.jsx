import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const GoogleCallback = () => {
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuth();

    useEffect(() => {
        const handleAuth = async () => {
            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get('code');

            if (code) {
                try {
                    await loginWithGoogle(code);
                    navigate('/dashboard');
                } catch (err) {
                    const apiError = err.response?.data?.detail || "Google sign-in failed. Please try again.";
                    setError(apiError);
                    // Optional: redirect to login with error message
                    navigate('/login', { state: { message: apiError } });
                }
            } else {
                const errorDescription = searchParams.get('error') || 'An unknown error occurred during Google authentication.';
                setError(errorDescription);
                navigate('/login', { state: { message: errorDescription } });
            }
        };

        handleAuth();
    }, [location, navigate, loginWithGoogle]);

    return <div>{error ? `Error: ${error}` : 'Authenticating with Google...'}</div>;
};

export default GoogleCallback;