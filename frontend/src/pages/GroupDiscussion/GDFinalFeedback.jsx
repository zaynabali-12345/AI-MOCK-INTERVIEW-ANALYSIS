import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner, FaLightbulb, FaThumbsUp, FaExclamationTriangle } from 'react-icons/fa';
import './GDFinalFeedback.css';
import apiClient from '../../services/api'; // Import the API client

const GDFinalFeedback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { transcript } = location.state || {};

    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!transcript) {
            setFeedback({ error: "No discussion transcript was provided." });
            setIsLoading(false);
            return;
        }

        const fetchFeedback = async () => {
            try {
                const response = await apiClient.post('/gd/feedback', { transcript });
                setFeedback(response.data);
            } catch (err) {
                console.error("Error generating feedback:", err);
                setFeedback({ error: "Failed to generate feedback. Please try again." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeedback();
    }, [transcript]);

    // This handles the case where the user navigates directly to this page
    if (!feedback && !isLoading) {
        return (
            <div className="feedback-page-container">
                <div className="feedback-card error-card">
                    <h2><FaExclamationTriangle /> No Feedback Available</h2>
                    <p>Could not load feedback data. Please try generating it again.</p>
                    <button onClick={() => navigate(-1)} className="feedback-page-btn">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-page-container">
            <div className="feedback-card">
                <h1 className="feedback-title">Group Discussion Analysis</h1>
                {isLoading ? (
                    <div className="loading-container">
                        <FaSpinner className="fa-spin" />
                        <p>Analyzing your discussion...</p>
                    </div>
                ) : feedback?.error ? (
                    <div className="error-container">
                        <h2><FaExclamationTriangle /> Analysis Failed</h2>
                        <p>{feedback.error}</p>
                    </div>
                ) : (
                    <div className="feedback-content">
                        <div className="feedback-section">
                            <h3><FaLightbulb /> Overall Summary</h3>
                            <p>{feedback.summary}</p>
                        </div>

                        <div className="feedback-grid">
                            <div className="feedback-section">
                                <h3><FaThumbsUp /> Strengths</h3>
                                <ul>
                                    {Array.isArray(feedback.strengths) ? (
                                        feedback.strengths.map((item, index) => <li key={index}>{item}</li>)
                                    ) : (
                                        <li>{feedback.strengths}</li>
                                    )}
                                </ul>
                            </div>
                            <div className="feedback-section">
                                <h3><FaExclamationTriangle /> Areas for Improvement</h3>
                                <ul>
                                    {Array.isArray(feedback.areas_for_improvement) ? (
                                        feedback.areas_for_improvement.map((item, index) => <li key={index}>{item}</li>)
                                    ) : (
                                        <li>{feedback.areas_for_improvement}</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* You can add score visualizations here in the future */}

                    </div>
                )}
                <div className="feedback-footer">
                    <button onClick={() => navigate('/dashboard')} className="feedback-page-btn">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GDFinalFeedback;