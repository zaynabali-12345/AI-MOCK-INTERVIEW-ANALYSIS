import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './ResultsPage.css';

function ResultsPage() {
  const location = useLocation();
  const { results } = location.state || {};

  // Handle case where user navigates directly to this page without data
  if (!results) {
    return (
      <div className="gradient-bg-container error-container">
        <h1>No Analysis Data Found</h1>
        <p>Please go back and analyze a resume first.</p>
        <Link to="/analyze" className="btn btn-primary">Analyze a Resume</Link>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="gradient-bg-container results-container">
      <h1>Analysis for {results.candidate_name !== 'N/A' ? results.candidate_name : 'Your Resume'}</h1>

      <div className="results-grid">
        {/* ATS Score Card */}
        <div className="result-card score-card">
          <h2>ATS Score</h2>
          <div className={`score-circle ${getScoreColor(results.ATS_score)}`}>
            <span>{results.ATS_score}%</span>
          </div>
          <p>This score estimates how well your resume matches the job description.</p>
        </div>

        {/* AI Feedback Card */}
        <div className="result-card feedback-card">
          <h2>AI-Powered Feedback</h2>
          <p>
            {results.ai_feedback?.feedback_summary || 
             (results.ai_feedback?.error || 'AI feedback could not be generated at this time.')}
          </p>
        </div>

        {/* Improvement Suggestions Card */}
        <div className="result-card suggestions-card">
          <h2>Improvement Suggestions</h2>
          <ul>
            {results.improvement_suggestions?.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>

        {/* Missing Skills Card */}
        {results.missing_skills?.length > 0 && (
          <div className="result-card skills-card">
            <h2>Missing Keywords</h2>
            <p>Consider adding these skills from the job description if you have them:</p>
            <div className="skills-tags">
              {results.missing_skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link to="/analyze" className="gradient-border-btn">Analyze Another Resume</Link>
    </div>
  );
}

export default ResultsPage;