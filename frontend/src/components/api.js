import axios from 'axios';
import authService from '../services/authService';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor to add the JWT token to every outgoing request if the user is logged in.
 */
api.interceptors.request.use(
    (config) => {
        const user = authService.getCurrentUser();
        if (user && user.access_token) {
            // FastAPI expects "Bearer <token>"
            config.headers['Authorization'] = `Bearer ${user.access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;