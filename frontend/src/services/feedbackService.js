// src/services/feedbackService.js
import axios from "axios";

const API_URL = "http://localhost:8000/api/v1/gd";

export const sendFeedbackRequest = async (transcript) => {
  try {
    const response = await axios.post(`${API_URL}/feedback`, {
      transcript,
    });
    console.log("AI Feedback:", response.data.feedback);
    return response.data.feedback;
  } catch (error) {
    console.error("Error getting feedback:", error);
    return "Error generating feedback.";
  }
};
