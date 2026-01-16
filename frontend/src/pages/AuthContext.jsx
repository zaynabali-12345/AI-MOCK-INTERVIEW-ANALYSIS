import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';
import apiClient from '../services/api.js'; // Import apiClient
 
const AuthContext = createContext(null);

/**
 * Custom hook to use the authentication context.
 * This must be exported so components like Login.jsx can use it.
 */
export const useAuth = () => {
    return useContext(AuthContext);
};

/**
 * Provider component that wraps the application and provides authentication state.
 */
export const AuthProvider = ({ children }) => {
    // currentUser now stores the full user profile, not the token object
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const tokenData = authService.getCurrentUser(); // This gets { access_token, ... }
            if (tokenData && tokenData.access_token) {
                try {
                    // If a token exists, fetch the user profile
                    const response = await apiClient.get('/auth/users/me');
                    setCurrentUser(response.data); // Set the user profile
                } catch (error) {
                    console.error("Failed to fetch user on startup, logging out.", error);
                    authService.logout(); // Token is invalid, so log out
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (username, password) => {
        // 1. authService.login stores the token object in localStorage
        await authService.login(username, password);
        // 2. Fetch user profile with the new token
        const response = await apiClient.get('/auth/users/me');
        // 3. Set the user profile in state
        setCurrentUser(response.data);
        return response.data;
    };

    const loginWithGoogle = async (code) => {
        // 1. authService.loginWithGoogle stores the token object in localStorage
        await authService.loginWithGoogle(code);
        // 2. Fetch user profile with the new token
        const response = await apiClient.get('/auth/users/me');
        // 3. Set the user profile in state
        setCurrentUser(response.data);
        return response.data;
    };

    const logout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        loginWithGoogle,
        logout,
    };

    // Don't render children until auth status is resolved
    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};