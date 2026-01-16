import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import './CompanyReviewDetails.css';

// --- Sub-components for better structure ---

const LoadingSpinner = () => (
  <div className="loading-spinner-container">
    <div className="loading-spinner"></div>
    <p>Generating AI-powered reviews for you...</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="error-display">
    <h2>Oops! Something went wrong.</h2>
    <p>{message}</p>
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="review-card">
    <div className="review-header">
      <div className="review-header-left">
        <h3>{review.role}</h3>
        <span className={`status-badge status-${review.status.toLowerCase()}`}>{review.status}</span>
      </div>
      <div className="review-header-right">
        <p>{review.location}</p>
        <p>{review.date}</p>
      </div>
    </div>

    <div className="review-section">
      <h4>Interview Summary</h4>
      <p>{review.interview_summary}</p>
    </div>

    <div className="review-section">
      <h4>Interview Process ({review.difficulty_level} Difficulty)</h4>
      <p><strong>Overview:</strong> {review.interview_process.overview}</p>
      <ul>
        {review.interview_process.rounds.map((round, index) => (
          <li key={`${review.role}-round-${index}`}>
            <strong>{round.round_name}:</strong> {round.details}
          </li>
        ))}
      </ul>
    </div>

    <div className="review-section">
      <h4>Sample Questions</h4>
      {review.interview_questions.map((q, index) => (
        <div key={`${review.role}-question-${index}`} className="question-block">
          <p><strong>Q: {q.question}</strong></p>
          <p><strong>A:</strong> {q.answer}</p>
        </div>
      ))}
    </div>

    <div className="review-section">
      <h4>Tips for Candidates</h4>
      <ul>
        {review.tips.map((tip, index) => (
          <li key={`${review.role}-tip-${index}`}>{tip}</li>
        ))}
      </ul>
    </div>
  </div>
);

const FilterPanel = ({ filters, setFilters, searchTerm, setSearchTerm }) => {
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    return (
        <aside className="filter-panel">
            <h4>Search & Filter</h4>
            <div className="filter-group">
                <input
                    type="text"
                    placeholder="Search by role, location..."
                    className="search-bar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="filter-group">
                <label>Difficulty</label>
                <select value={filters.difficulty} onChange={(e) => handleFilterChange('difficulty', e.target.value)}>
                    <option value="All">All</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>
            <div className="filter-group">
                <label>Status</label>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                    <option value="All">All</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
            <div className="filter-group">
                <label>Date</label>
                <select value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)}>
                    <option value="All">All</option>
                    <option value="Last 7 days">Last 7 days</option>
                    <option value="Last 30 days">Last 30 days</option>
                    <option value="Last 6 months">Last 6 months</option>
                </select>
            </div>
        </aside>
    );
};

// --- Main Component ---

function CompanyReviewDetails() {
  const { companyName } = useParams();
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'All',
    status: 'All',
    date: 'All',
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        // The endpoint should match your backend router configuration
        const response = await apiClient.get(`/interview-reviews/${companyName}`);
        setAllReviews(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch interview reviews. Please try again later.');
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    if (companyName) {
      fetchReviews();
    }
  }, [companyName]);

  const filteredReviews = useMemo(() => {
    return allReviews.filter(review => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        review.role.toLowerCase().includes(searchLower) ||
        review.location.toLowerCase().includes(searchLower);

      // Difficulty filter
      const matchesDifficulty = filters.difficulty === 'All' || review.difficulty_level === filters.difficulty;

      // Status filter
      const matchesStatus = filters.status === 'All' || review.status === filters.status;

      // Date filter
      let matchesDate = true;
      if (filters.date !== 'All') {
        const reviewDate = new Date(review.date);
        const today = new Date();
        const daysAgo = (today - reviewDate) / (1000 * 60 * 60 * 24);

        if (filters.date === 'Last 7 days') matchesDate = daysAgo <= 7;
        if (filters.date === 'Last 30 days') matchesDate = daysAgo <= 30;
        if (filters.date === 'Last 6 months') matchesDate = daysAgo <= 180;
      }

      return matchesSearch && matchesDifficulty && matchesStatus && matchesDate;
    });
  }, [allReviews, searchTerm, filters]);

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return <ErrorDisplay message={error} />;
    }

    if (allReviews.length === 0) {
      return <ErrorDisplay message="No reviews found for this company." />;
    }

    return (
      <>
        <div className="company-header">
          <img 
            src={`https://logo.clearbit.com/${companyName.toLowerCase()}.com`} 
            alt={`${companyName} logo`} 
            className="company-logo" />
          <h1>Interview Reviews for {allReviews.length > 0 ? allReviews[0].company : companyName}</h1>
        </div>
        <div className="review-layout">
            <div className="review-list">
                {filteredReviews.length > 0 ? filteredReviews.map((review, index) => (
                    <ReviewCard key={`${review.role}-${review.date}-${index}`} review={review} />
                )) : <p className="no-results-message">No reviews match your current filters.</p>}
            </div>
            <FilterPanel
                filters={filters}
                setFilters={setFilters}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
        </div>
      </>
    );
  };

  return (
    <div className="company-review-details-container">{renderContent()}</div>
  );
}

export default CompanyReviewDetails;
