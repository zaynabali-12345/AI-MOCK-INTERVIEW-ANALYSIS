import apiClient from './api'; // Import the centralized API client

/**
 * Fetches the dashboard data for the currently logged-in user.
 * @returns {Promise<any>} The dashboard data from the server.
 */
const getDashboardData = () => {
    // The interceptor in apiClient will automatically add the auth header.
    return apiClient.get('/dashboard/');
};

export default { getDashboardData };