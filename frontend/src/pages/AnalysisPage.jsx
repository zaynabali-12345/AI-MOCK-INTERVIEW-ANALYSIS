import React, { useState, useRef } from 'react';
import './AnalysisPage.css';
import { Link } from 'react-router-dom';
import { FaFileUpload, FaFileAlt } from 'react-icons/fa';
import './ResultsPage.css';
import apiClient from '../services/api'; 

function AnalysisPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setResumeFile(event.target.files[0]);
  };

  const handleAnalyzeClick = async () => {
    if (!resumeFile) {
      setError('Please upload a resume file.');
      return;
    }
    // Add validation for the job description
    if (!jobDescription.trim()) {
      setError('Please paste the job description.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResults(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_description', jobDescription);

    try {
      const response = await apiClient.post('/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // With axios, a non-2xx status will throw an error, so we don't need to check `response.ok`
      // The response data is directly available on `response.data`
      setAnalysisResults(response.data.analysis);

    } catch (err) {
      // Axios wraps the error response in `err.response`
      setError(err.response?.data?.detail || err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setJobDescription('');
    setError('');
    setAnalysisResults(null);
    // Use a ref to reset the file input's value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="gradient-bg-container">
      {!analysisResults ? (
        <>
          <div className="header-section">
            <h1>Resume Analyzer</h1>
            <p>Upload your resume and paste a job description to get your match score and AI-powered feedback.</p>
          </div>

          <div className="form-container-gradient">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="resume-upload">
                    <FaFileUpload className="icon" />
                    Upload Resume
                  </label>
                  <input id="resume-upload" ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} className="file-input" />
                  <label htmlFor="resume-upload" className="file-input-label">
                    <FaFileUpload className="file-icon" />
                    <span className="file-input-text">{resumeFile ? resumeFile.name : 'Click to upload a file'}</span>
                    <span className="file-input-hint">PDF or DOCX</span>
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="jd-textarea">
                    <FaFileAlt className="icon" />
                    Job Description
                  </label>
                  <textarea id="jd-textarea" rows="10" className="gradient-form-textarea" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..."/>
                </div>
              </div>

              <div className="button-container">
                <button type="button" onClick={handleAnalyzeClick} className="gradient-border-btn" disabled={isLoading || !resumeFile || !jobDescription.trim()}>
                  {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
                {isLoading && (
                  <div className="progress-bar-container"><div className="progress-bar"></div></div>
                )}
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="results-container">
          <h1>Analysis for {analysisResults.candidate_name !== 'N/A' ? analysisResults.candidate_name : 'Your Resume'}</h1>

          <div className="results-grid">
            {/* ATS Score Card */}
            <div className="result-card score-card">
              <h2>ATS Score</h2>
              <div className={`score-circle ${getScoreColor(analysisResults.ATS_score)}`}>
                <span>{analysisResults.ATS_score}%</span>
              </div>
              <p>This score estimates how well your resume matches the job description.</p>
            </div>

            {/* AI Feedback Card */}
            <div className="result-card feedback-card">
              <h2>AI-Powered Feedback</h2>
              <p>
                {analysisResults.ai_feedback?.feedback_summary || 
                 (analysisResults.ai_feedback?.error || 'AI feedback could not be generated at this time.')}
              </p>
            </div>

            {/* Improvement Suggestions Card */}
            <div className="result-card suggestions-card">
              <h2>Improvement Suggestions</h2>
              <ul>
                {analysisResults.improvement_suggestions?.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            {/* Missing Skills Card */}
            {analysisResults.missing_skills?.length > 0 && (
              <div className="result-card skills-card">
                <h2>Missing Keywords</h2>
                <p>Consider adding these skills from the job description if you have them:</p>
                <div className="skills-tags">
                  {analysisResults.missing_skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/analyze" className="btn btn-secondary">Analyze Another Resume</Link>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AnalysisPage;