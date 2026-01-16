import React, { useState } from 'react';
import './CareerAdvisor.css';
import axios from 'axios';

const CareerAdvisor = () => {
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [interests, setInterests] = useState([]);
    const [interestInput, setInterestInput] = useState('');
    const [education, setEducation] = useState('');
    const [experience, setExperience] = useState('0');
    const [careerGoals, setCareerGoals] = useState('');
    const [industry, setIndustry] = useState('Technology');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recommendations, setRecommendations] = useState(null);

    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (index) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const addInterest = () => {
        if (interestInput.trim() && !interests.includes(interestInput.trim())) {
            setInterests([...interests, interestInput.trim()]);
            setInterestInput('');
        }
    };

    const removeInterest = (index) => {
        setInterests(interests.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setRecommendations(null);

        const requestData = { skills, interests, education, experience, careerGoals, industry };

        try {
            const response = await axios.post('/api/v1/career-path', requestData);
            setRecommendations(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'An unexpected error occurred. Please try again.');
            console.error("Career Advisor API error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setRecommendations(null);
        setError(null);
        setLoading(false);
    };

    // --- Sub-components for rendering states ---

    const LoadingSpinner = () => (
        <div className="ca-loading-spinner-container">
            <div className="ca-loading-spinner"></div>
            <p>Our AI is crafting your personalized career paths...</p>
        </div>
    );

    const ErrorDisplay = ({ message, onReset }) => (
        <div className="ca-error-display">
            <h2>Oops! Something went wrong.</h2>
            <p>{message}</p>
            <button onClick={onReset} className="ca-reset-btn">Try Again</button>
        </div>
    );

    const CareerPathCard = ({ path }) => (
        <div className="cp-card">
            <div className="cp-card-header">
                <h3 className="cp-card-title">{path.career_title}</h3>
                <div className="cp-match-score">
                    <span>{path.match_score}</span>
                    <p>Match Score</p>
                </div>
            </div>
            <div className="cp-roadmap">
                {path.roadmap.map((step, index) => (
                    <div key={index} className="cp-roadmap-step">
                        <div className="cp-step-number">{index + 1}</div>
                        <div className="cp-step-content">
                            <h4 className="cp-step-title">{step.step_title}</h4>
                            <p className="cp-step-description">{step.description}</p>
                            <div className="cp-step-details">
                                <div>
                                    <strong>Skills to Build:</strong>
                                    <span>{step.required_skills.join(', ')}</span>
                                </div>
                                {step.certifications && step.certifications.length > 0 && (
                                    <div>
                                        <strong>Certifications:</strong>
                                        <span>{step.certifications.join(', ')}</span>
                                    </div>
                                )}
                                <div>
                                    <strong>Resources:</strong>
                                    <span>{step.resources.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <ErrorDisplay message={error} onReset={handleReset} />;
        }
        if (recommendations) {
            return (
                <div className="ca-results-container">
                    <div className="ca-results-header">
                        <h2>Your Personalized Career Paths</h2>
                        <button onClick={handleReset} className="ca-reset-btn">
                            &#8592; Back to Form
                        </button>
                    </div>
                    {recommendations.map((path, index) => (
                        <CareerPathCard key={index} path={path} />
                    ))}
                </div>
            );
        }
        // Pass all props to the form component
        return <CareerAdvisorForm {...{
            skills, skillInput, setSkillInput, addSkill, removeSkill,
            interests, interestInput, setInterestInput, addInterest, removeInterest,
            education, setEducation, experience, setExperience,
            careerGoals, setCareerGoals, industry, setIndustry,
            handleSubmit
        }} />;
    };

    return (
        <div className="ca-container">
            <div className="ca-wrapper">
                {/* Header Section */}
                <div className="ca-header">
                    <div className="ca-breadcrumb">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                        Career Intelligence
                    </div>
                    <h1 className="ca-main-title">Plan Your Career Path</h1>
                    <p className="ca-header-description">
                        Get AI-powered career path recommendations tailored to your skills, interests, and goals with AI Mock Interview.
                    </p>
                    <p className="ca-header-subtitle">
                        Build your future career with confidence
                    </p>
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

const CareerAdvisorForm = ({
    skills, skillInput, setSkillInput, addSkill, removeSkill,
    interests, interestInput, setInterestInput, addInterest, removeInterest,
    education, setEducation, experience, setExperience,
    careerGoals, setCareerGoals, industry, setIndustry,
    handleSubmit
}) => {
    const isFormIncomplete = skills.length === 0 || interests.length === 0 || !education || !careerGoals;
    return (
        <form className="ca-form-card" onSubmit={handleSubmit}>
            <p className="ca-form-intro">
                Get personalized career path recommendations
            </p>

            {/* Skills Section */}
            <div className="ca-form-group">
                <label className="ca-label">Skills <span className="ca-required">*</span></label>
                <div className="ca-input-group">
                    <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="e.g., Python, React, SQL" className="ca-input" />
                    <button type="button" onClick={addSkill} className="ca-add-btn skills-btn"><span>+</span> Add</button>
                </div>
                <p className="ca-input-hint">Hit Enter or click Add to add skill</p>
                <div className="ca-tags-container">
                    {skills.map((skill, index) => (
                        <span key={index} className="ca-tag skill-tag">
                            {skill}
                            <button type="button" onClick={() => removeSkill(index)} className="ca-tag-remove-btn">×</button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Interests Section */}
            <div className="ca-form-group">
                <label className="ca-label">Interests <span className="ca-required">*</span></label>
                <div className="ca-input-group">
                    <input type="text" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())} placeholder="e.g., Machine Learning, Leadership" className="ca-input" />
                    <button type="button" onClick={addInterest} className="ca-add-btn interests-btn"><span>+</span> Add</button>
                </div>
                <p className="ca-input-hint">Hit Enter or click Add to add interest</p>
                <div className="ca-tags-container">
                    {interests.map((interest, index) => (
                        <span key={index} className="ca-tag interest-tag">
                            {interest}
                            <button type="button" onClick={() => removeInterest(index)} className="ca-tag-remove-btn">×</button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Grid for other inputs */}
            <div className="ca-grid">
                <div className="ca-form-group">
                    <label className="ca-label">Education <span className="ca-required">*</span></label>
                    <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Bachelor's in Computer Science" className="ca-input" required />
                </div>
                <div className="ca-form-group">
                    <label className="ca-label">Years of Experience</label>
                    <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="0" min="0" className="ca-input" />
                </div>
                <div className="ca-form-group">
                    <label className="ca-label">Career Goals <span className="ca-required">*</span></label>
                    <input type="text" value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} placeholder="Become a Senior Developer" className="ca-input" required />
                </div>
                <div className="ca-form-group">
                    <label className="ca-label">Preferred Industry</label>
                    <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="ca-select">
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Education">Education</option>
                    </select>
                </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="ca-submit-btn" disabled={isFormIncomplete}>
                Get Career Paths
            </button>
        </form>
    );
};

export default CareerAdvisor;
