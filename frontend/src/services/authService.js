import axios from 'axios';

// The base URL of your FastAPI backend
const API_URL = 'http://127.0.0.1:8000/api/v1/auth';

/**
 * Sign up a new user.
 * @param {string} fullName - The user's full name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<any>} The response from the server.
 */
const signup = (fullName, email, password, confirmPassword) => {
    return axios.post(`${API_URL}/signup`, {
        full_name: fullName,
        email: email,
        password: password,
        confirm_password: confirmPassword
    });
};

/**
 * Log in a user.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<any>} The response from the server, containing the access token.
 */
const login = (email, password) => {
    // For OAuth2PasswordRequestForm, data must be sent as FormData
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    return axios.post(`${API_URL}/token`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        // If login is successful, store the token
        if (response.data.access_token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    });
};

/**
 * Log in a user via Google OAuth.
 * @param {string} idToken - The ID Token from Google Sign-In.
 * @returns {Promise<any>} The response from the server, containing the access token.
 */
const loginWithGoogle = (credential) => {
    // The backend's GoogleToken model has a field named 'code', but we are sending the ID token (credential).
    return axios.post(`${API_URL}/google`, { code: credential })
        .then(response => {
            // If login is successful, store the token
            if (response.data.access_token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        });
};

/**
 * Log out the current user by removing the token from local storage.
 */
const logout = () => {
    localStorage.removeItem('user');
};

/**
 * Get the current user's data from local storage.
 * @returns {any | null} The user object or null if not found.
 */
const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        return JSON.parse(userStr);
    }
    return null;
};

const authService = {
    signup,
    login,
    loginWithGoogle,
    logout,
    getCurrentUser,
};

export default authService;
