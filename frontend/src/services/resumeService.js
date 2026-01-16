import apiClient from './api';

const analyzeResume = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // The apiClient will handle the base URL and auth headers
    return apiClient.post('/resume/analyze', formData, {
        // No need to set Content-Type, axios handles it for FormData
    });
};

export default {
    analyzeResume,
};