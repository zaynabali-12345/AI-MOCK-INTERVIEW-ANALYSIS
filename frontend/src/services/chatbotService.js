import apiClient from './api';

/**
 * Sends the conversation history to the chatbot backend and gets a response.
 * @param {Array<Object>} history - An array of message objects, e.g., [{ role: 'user', content: 'Hello' }]
 * @returns {Promise<any>} The response from the server.
 */
const sendMessage = (history) => {
    return apiClient.post('/chatbot/chat', { history });
};

const chatbotService = {
    sendMessage,
};

export default chatbotService;