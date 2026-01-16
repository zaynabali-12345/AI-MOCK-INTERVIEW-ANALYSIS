import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { FaCheckCircle, FaExclamationTriangle, FaBullseye, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import './HRFinalFeedback.css';

const ScoreBar = ({ label, score }) => {
    const percentage = score * 10;
    return (
        <div className="score-bar-container">
            <span className="score-label">{label.replace(/_/g, ' ')}</span>
            <div className="score-bar-wrapper">
                <div className="score-bar" style={{ width: `${percentage}%` }}></div>
            </div>
            <span className="score-value">{score}/10</span>
        </div>
    );
};

const HRFinalFeedback = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!interviewId) {
            setError("No interview ID provided.");
            setLoading(false);
            return;
        }

        const fetchFeedback = async () => {
            try {
                // The backend endpoint is a POST request to trigger generation if needed
                const response = await apiClient.post(`/hr/feedback/${interviewId}`);
                setFeedback(response.data);
            } catch (err) {
                console.error("Error fetching feedback:", err);
                setError("Failed to load your interview feedback. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [interviewId]);

    if (loading) {
        return (
            <div className="feedback-loading-container">
                <FaSpinner className="fa-spin" />
                <h2>Generating Your Feedback...</h2>
                <p>Our AI is analyzing your performance. This might take a moment.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feedback-error-container">
                <FaExclamationTriangle size={50} />
                <h2>Oops! Something went wrong.</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')} className="feedback-btn">
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="hr-feedback-page">
            <div className="feedback-card">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    <FaArrowLeft /> Back to Dashboard
                </button>
                <header className="feedback-header">
                    <h1>Interview Performance Review</h1>
                    <p>Here is the AI-generated feedback for your recent HR interview.</p>
                </header>

                <main className="feedback-body">
                    <div className="score-summary-grid">
                        <div className="overall-score-container">
                            <div className="score-circle">
                                <span className="overall-score-value">{feedback.overall_score.toFixed(1)}</span>
                                <span className="overall-score-label">Overall Score</span>
                            </div>
                        </div>
                        <div className="detailed-scores">
                            <h3>Score Breakdown</h3>
                            {feedback.scores && Object.entries(feedback.scores).map(([key, value]) => (
                                <ScoreBar key={key} label={key} score={value} />
                            ))}
                        </div>
                    </div>

                    <div className="summary-section">
                        <h3>AI Summary</h3>
                        <p>{feedback.summary}</p>
                    </div>

                    <div className="feedback-details-grid">
                        <div className="feedback-column strengths">
                            <h3><FaCheckCircle /> Strengths</h3>
                            <ul>
                                {feedback.strengths.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="feedback-column improvements">
                            <h3><FaBullseye /> Areas for Improvement</h3>
                            <ul>
                                {feedback.areas_for_improvement.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </main>

                <footer className="feedback-footer">
                    <button onClick={() => navigate('/hr-form')} className="feedback-btn primary">
                        Try Another Interview
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default HRFinalFeedback;