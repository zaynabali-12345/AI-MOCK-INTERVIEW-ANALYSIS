import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './InterviewReviewPage.css'; // Corrected CSS import name

const companies = [
    {
        name: 'Cognizant',
        logo: 'https://logo.clearbit.com/cognizant.com',
        industry: 'IT Services & Consulting',
        headquarters: 'Teaneck, New Jersey, USA',
        overview: 'Cognizant helps global businesses modernize technology, reimagine processes, and transform customer experiences. Renowned for its digital innovation and strong learning culture, it offers dynamic roles in AI, automation, and enterprise solutions.',
        tagline: 'Engineer modern business.',
        color: '#3b82f6',
        path: '/interview-review/Cognizant'
    },
    {
        name: 'LTIMindtree',
        logo: 'https://logo.clearbit.com/ltimindtree.com',
        industry: 'Technology Consulting & Digital Solutions',
        headquarters: 'Mumbai, India',
        overview: 'LTIMindtree delivers cloud, data, and digital transformation services across industries worldwide. Formed from the merger of L&T Infotech and Mindtree, it promotes agility, innovation, and teamwork.',
        tagline: 'Ready for Next.',
        color: '#0ea5e9',
        path: '/interview-review/LTIMindtree'
    },
    {
        name: 'Deloitte',
        logo: 'https://logo.clearbit.com/deloitte.com',
        industry: 'Professional Services (Audit, Consulting, Tax, Advisory)',
        headquarters: 'London, UK',
        overview: 'Deloitte combines technology, strategy, and innovation to solve complex business problems. With a people-first culture and strong focus on ethics and leadership, it\'s ideal for aspiring consultants and analysts.',
        tagline: 'Make an impact that matters.',
        color: '#10b981',
        path: '/interview-review/Deloitte'
    },
    {
        name: 'Infosys',
        logo: 'https://logo.clearbit.com/infosys.com',
        industry: 'Digital Services & Consulting',
        headquarters: 'Bengaluru, India',
        overview: 'Infosys empowers organizations to embrace digital transformation through AI, automation, and cloud. Known for its innovation and global impact, it offers a structured career path and world-class learning facilities.',
        tagline: 'Navigate your next.',
        color: '#eab308',
        path: '/interview-review/Infosys'
    },
    {
        name: 'Tata Consultancy Services (TCS)',
        logo: 'https://logo.clearbit.com/tcs.com',
        industry: 'IT Services & Business Solutions',
        headquarters: 'Mumbai, India',
        overview: 'TCS drives global enterprises through technology and business innovation. It offers stable career growth, diverse opportunities, and a culture rooted in trust and learning.',
        tagline: 'Building on belief.',
        color: '#a855f7',
        path: '/interview-review/TCS'
    }
];

const InterviewReview = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="interview-review-container">
            <div className="ir-header-section">
                <div className="ir-breadcrumb">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    Interview Intelligence
                </div>
                <h1 className="ir-main-title">Interview Review</h1>
                <p className="ir-header-description">
                    Step into your next interview with confidence. Explore real questions, insider tips, and company-specific preparation resources from a community of successful candidates.
                </p>
            </div>

            <div className="ir-horizontal-scroll-container">
                {companies.map((company, index) => (
                    <Link to={company.path} key={index} className="ir-card-link">
                        <div
                            className={`ir-company-card ${hoveredIndex === index ? 'hovered' : ''}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="ir-card-color-bar" style={{ backgroundColor: company.color }}></div>
                            <div className="ir-card-header">
                                <div className="ir-card-logo-wrapper">
                                    <img src={company.logo} alt={`${company.name} logo`} className="ir-card-logo" />
                                </div>
                                <h3 className="ir-card-name">{company.name}</h3>
                            </div>

                            <div className="ir-card-info-item">
                                <span className="ir-card-info-icon">🏢</span>
                                <div>
                                    <p className="ir-card-info-label">Industry</p>
                                    <p className="ir-card-info-value">{company.industry}</p>
                                </div>
                            </div>

                            <div className="ir-card-info-item">
                                <span className="ir-card-info-icon">🌍</span>
                                <div>
                                    <p className="ir-card-info-label">Headquarters</p>
                                    <p className="ir-card-info-value">{company.headquarters}</p>
                                </div>
                            </div>

                            <div className="ir-card-info-item">
                                <span className="ir-card-info-icon">💡</span>
                                <div>
                                    <p className="ir-card-info-label">Overview</p>
                                    <p className="ir-card-info-overview">{company.overview}</p>
                                </div>
                            </div>

                            {/* View Details Button - Shows on hover */}
                            <div className="ir-view-details-btn">
                                View Details
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>

                        </div>
                    </Link>
                ))}
            </div>
            <div className="ir-scroll-indicator">
                ← Scroll horizontally to explore all companies →
            </div>
        </div>
    );
};

export default InterviewReview;
