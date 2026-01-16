import React, { useState } from 'react';
import './JobPlatformRankings.css';
import axios from 'axios';

const JobPlatformRankings = () => {
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [workArrangement, setWorkArrangement] = useState('Hybrid');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [employmentType, setEmploymentType] = useState('Full-time');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rankings, setRankings] = useState(null);

  const handleAddSkill = () => {
    if (currentSkill.trim() && skills.length < 10 && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRankings(null);

    const formData = {
      skills,
      workArrangement,
      experienceLevel,
      employmentType
    };

    try {
      const response = await axios.post('/api/v1/job-tracker/rankings', formData);
      setRankings(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An unexpected error occurred. Please try again.');
      console.error("Job Platform API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRankings(null);
    setError(null);
    setLoading(false);
  };

  // --- Sub-components for different states ---

  const LoadingSpinner = () => (
    <div className="jp-loading-spinner-container">
      <div className="jp-loading-spinner"></div>
      <p>Our AI is analyzing the job market for you...</p>
    </div>
  );

  const ErrorDisplay = ({ message, onReset }) => (
    <div className="jp-error-display">
      <h2>Oops! Something went wrong.</h2>
      <p>{message}</p>
      <button onClick={onReset} className="jp-reset-btn">Try Again</button>
    </div>
  );

  const RankingCard = ({ ranking, rank }) => (
    <div className="jp-ranking-card">
      <div className="jp-card-rank-badge">{rank}</div>
      <div className="jp-card-header">
        <img src={ranking.logo_url} alt={`${ranking.platform_name} logo`} className="jp-platform-logo" />
        <div className="jp-platform-info">
          <h3 className="jp-platform-name">{ranking.platform_name}</h3>
          <div className="jp-relevance-score">
            <div className="jp-score-bar" style={{ width: `${ranking.relevance_score}%` }}></div>
            <span>{ranking.relevance_score}% Relevance</span>
          </div>
        </div>
      </div>
      <p className="jp-card-description">{ranking.description}</p>
      <div className="jp-pros-cons">
        <div className="jp-pros">
          <h4>Pros</h4>
          <ul>
            {ranking.pros.map((pro, i) => <li key={i}>{pro}</li>)}
          </ul>
        </div>
        <div className="jp-cons">
          <h4>Cons</h4>
          <ul>
            {ranking.cons.map((con, i) => <li key={i}>{con}</li>)}
          </ul>
        </div>
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
    if (rankings) {
      return (
        <div className="jp-results-container">
          <div className="jp-results-header">
            <h2>Your Personalized Platform Rankings</h2>
            <button onClick={handleReset} className="jp-reset-btn">
              &#8592; Back to Form
            </button>
          </div>
          {rankings.map((ranking, index) => (
            <RankingCard key={index} ranking={ranking} rank={index + 1} />
          ))}
        </div>
      );
    }
    // The form is returned by default if no other state is active
    return (
        <form onSubmit={handleSubmit}>
            <div className="form-section">
              <label className="form-label">Skills and Job Titles</label>
              
              <div className="skills-display">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      className="remove-skill"
                      onClick={() => handleRemoveSkill(index)}
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  className="skill-input"
                  placeholder="e.g., Python, React, Java"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  className="add-button"
                  onClick={handleAddSkill}
                  disabled={!currentSkill.trim() || skills.length >= 10}
                >
                  <span className="plus-icon">+</span>
                  Add
                </button>
              </div>
              
              <p className="input-hint">
                Press Enter or click Add to include your skill or job title
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Work Arrangement</label>
                <select
                  className="form-select"
                  value={workArrangement}
                  onChange={(e) => setWorkArrangement(e.target.value)}
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  className="form-select"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Lead/Principal">Lead/Principal</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  className="form-select"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={skills.length === 0}>
              Find Job Platforms
            </button>

            <p className="footer-text">
              Add your skills and preferences to find the best platforms for your job search
            </p>
          </form>
    );
  };

  return (
    <div className="job-platform-container">
      <div className="job-platform-card">
        <div className="header-section">
          <h1 className="main-title">Top Job Platforms Rankings</h1>
          <p className="subtitle">Get your personalized Job platforms rankings</p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default JobPlatformRankings;
