import axios from 'axios';
import authService from './authService';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
    (config) => {
        const user = authService.getCurrentUser();
        if (user && user.access_token) {
            config.headers['Authorization'] = `Bearer ${user.access_token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;