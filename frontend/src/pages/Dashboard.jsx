import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Legend } from 'recharts';
import {
    FaBars,
    FaClipboardList,
    FaCompass,
    FaBriefcase,
    FaUsers,
    FaUserTie,
    FaFileAlt,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';
import dashboardService from '../services/dashboardService';

// --- Sidebar Navigation Items ---
const navItems = [
    { path: '/interview-review', icon: FaClipboardList, label: 'Interview Review' },
    { path: '/career-advisor', icon: FaCompass, label: 'Career Advisor' },
    { path: '/job-tracker', icon: FaBriefcase, label: 'Job Tracker' },
    { path: '/gd', icon: FaUsers, label: 'GD Round' },
    { path: '/hr-form', icon: FaUserTie, label: 'HR Round' },
    { path: '/analyze', icon: FaFileAlt, label: 'Resume Analyzer' },
];

// --- Mock Data for a visually appealing chart ---
const mockPerformanceHistory = [
    { date: 'Jan', score: 75, target: 80 },
    { date: 'Feb', score: 78, target: 82 },
    { date: 'Mar', score: 77, target: 84 },
    { date: 'Apr', score: 82, target: 86 },
    { date: 'May', score: 85, target: 88 },
    { date: 'Jun', score: 88, target: 90 },
    { date: 'Jul', score: 92, target: 92 },
];

// --- Custom Tooltip for the Chart ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`${label}`}</p>
                {payload.map((pld, index) => (
                    <p key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value}%`}</p>
                ))}
            </div>
        );
    }
    return null;
};

const tourSteps = [
    { selector: '.header-left h1', content: 'This is your command center for interview preparation.' },
    { selector: '.stats-overview', content: 'Keep an eye on your key metrics here, including your total sessions and average scores.' },
    { selector: '.header-right .streak-badge', content: 'Stay consistent! Your streak tracks your daily practice sessions. Keep the fire going!' },
    { selector: '.chart-card', content: 'Visualize your progress over time. This chart shows how your scores are improving with each session.' },
    { selector: '.activity-section', content: 'Quickly review your most recent practice sessions here.' },
    { selector: '.header-center', content: 'Ready to practice? Jump into a GD or HR round right from here to get started!' },
];

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [tourActive, setTourActive] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    const startTour = () => {
        setShowWelcomeModal(false);
        setTourActive(true);
    };

    const handleNextTourStep = () => {
        if (tourStep < tourSteps.length - 1) {
            setTourStep(tourStep + 1);
        } else {
            endTour(true);
        }
    };

    const endTour = (markCompleted = true) => {
        setTourActive(false);
        if (markCompleted) {
            localStorage.setItem('dashboardTourCompleted', 'true');
        }
    };

    const currentStep = tourSteps[tourStep];
    const targetElement = tourActive ? document.querySelector(currentStep.selector) : null;
    const tooltipPosition = targetElement ? targetElement.getBoundingClientRect() : null;

    const tooltipStyle = tooltipPosition ? {
        top: `${tooltipPosition.bottom + 10}px`,
        left: `${tooltipPosition.left}px`,
    } : {};

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await dashboardService.getDashboardData();
                setDashboardData(response.data);
            } catch (err) {
                setError('Failed to load dashboard data. Please try again.');
                console.error("Dashboard fetch error:", err);
            } finally {
                // This block runs after the data is fetched, regardless of success or failure.
                setLoading(false);

                // Now that loading is complete, check if the tour should run.
                const tourCompleted = localStorage.getItem('dashboardTourCompleted');
                if (!tourCompleted) {
                    // Use a small timeout to ensure the DOM has fully painted after loading.
                    setTimeout(() => setShowWelcomeModal(true), 100);
                }
            }
        };

        fetchData();
    }, []);

    // Skeleton Loader
    if (loading) {
        return <div className="dashboard-container skeleton-loading"><h1>Loading Dashboard...</h1></div>;
    }

    if (error) {
        return <div className="dashboard-container error-state"><h1>{error}</h1></div>;
    }

    const {
        userName, profileImage, interviewCount, averageScore, bestScore, streak,
        weakAreas, AIFeedbackSummary, interviewHistory
    } = dashboardData || {};

    return (
        <div className="dashboard-layout">
            {showWelcomeModal && (
                <>
                    <div className="tour-backdrop"></div>
                    <div className="welcome-modal">
                        <h2>Welcome to Your Dashboard! 👋</h2>
                        <p>Let's take a quick tour to see how you can make the most of your interview preparation.</p>
                        <div className="welcome-modal-actions">
                            <button onClick={() => endTour(true)} className="btn-skip">Skip Tour</button>
                            <button onClick={startTour} className="btn-start">Start Tour</button>
                        </div>
                    </div>
                </>
            )}

            {tourActive && targetElement && (
                <>
                    <div className="tour-backdrop" onClick={endTour}></div>
                    <div className="tour-highlight" style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                        width: `${tooltipPosition.width}px`,
                        height: `${tooltipPosition.height}px`,
                    }}></div>
                    <div className="tour-tooltip" style={tooltipStyle}>
                        <div className="tour-tooltip-content">
                            <p>{currentStep.content}</p>
                            <span className="tour-step-indicator">{tourStep + 1} / {tourSteps.length}</span>
                        </div>
                        <button onClick={handleNextTourStep}>Next</button>
                    </div>
                </>
            )}
            {/* Collapsible Sidebar */}
            <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">
                            <FaBars />
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="logo-text">Dashboard</span>
                        )}
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <li key={index} className="nav-item">
                                    <Link to={item.path} className="nav-link">
                                        <Icon className="nav-icon" />
                                        {!isSidebarCollapsed && (
                                            <span className="nav-text">{item.label}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Toggle Button */}
                <div className="sidebar-footer">
                    <button
                        className="sidebar-toggle-btn"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        {isSidebarCollapsed ? (
                            <FaChevronRight />
                        ) : (
                            <>
                                <FaChevronLeft />
                                <span>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
                <div className="container">
                    {/* Header */}
                    <div className="header">
                        <div className="header-left">
                            <h1>Welcome back, {userName}! 👋</h1>
                            <p>Let's continue your interview preparation journey</p>
                        </div>
                        <div className="header-center">
                            <Link to="/gd" className="start-btn start-btn-gd">
                                <span>🎯</span> Start GD Round
                            </Link>
                            <Link to="/hr-form" className="start-btn start-btn-hr">
                                <span>💼</span> Start HR Round
                            </Link>
                        </div>
                        <div className="header-right">
                            <div className="streak-badge">
                                <span>🔥</span>
                                <span className="streak-number">{streak || 0}</span>
                                <span style={{ color: '#888' }}>Streak</span>
                            </div>
                            <div className="streak-badge">
                                <span>🏆</span>
                                <span className="streak-number">{bestScore || 0}%</span>
                                <span style={{ color: '#888' }}>Best</span>
                            </div>
                            <Link to="/profile">
                                {profileImage ? (
                                    <img src={profileImage} alt={userName} className="profile-avatar" />
                                ) : (
                                    <div className="profile-avatar">{(userName || 'U').charAt(0)}</div>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Badge Alert */}
                    <div className="badge-alert">
                        <div className="badge-icon">🏆</div>
                        <div className="badge-content">
                            <h3>Almost There!</h3>
                            <p>You're just <span className="badge-highlight">2 sessions</span> away from earning the <span className="badge-highlight">"Master Communicator"</span> badge!</p>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="stats-overview">
                        <div className="stat-card">
                            <div className="stat-label">Total Sessions</div>
                            <div className="stat-value">{interviewCount || 0}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Avg Score</div>
                            <div className="stat-value">{averageScore || 0}%</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Best Score</div>
                            <div className="stat-value">{bestScore || 0}%</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Areas to Improve</div>
                            <div className="stat-value">{weakAreas?.length || 0}</div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="main-grid">
                        {/* Performance Section */}
                        <div className="performance-section">
                            <h2 className="section-title">Performance Overview</h2>

                            {/* Progress Chart */}
                            <div className="chart-card">
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#ffffff' }}>Your Progress Over Time</h3>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={mockPerformanceHistory} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#DA70D6" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#DA70D6" stopOpacity={0}/>
                                                </linearGradient>
                                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>
                                            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                                            <XAxis dataKey="date" stroke="#666" fontSize={12} />
                                            <YAxis stroke="#666" fontSize={12} domain={[60, 100]} unit="%" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                                            <Area type="monotone" dataKey="score" name="Your Score" stroke="none" fill="url(#colorScore)" />
                                            <Line type="monotone" dataKey="score" name="Your Score" stroke="#DA70D6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} filter="url(#glow)" />
                                            <Line type="monotone" dataKey="target" name="Target Score" stroke="#8884d8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Insights */}
                            <div className="insights-section">
                                <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>Key Insights</h3>
                                <div className="insights-grid">
                                    <div className="insight-item">
                                        <div className="insight-title">AI Feedback Summary</div>
                                        <div className="insight-text">{AIFeedbackSummary || 'No summary yet.'}</div>
                                    </div>
                                    {(weakAreas && weakAreas.length > 0) && (
                                        <div className="insight-item">
                                            <div className="insight-title">Areas to Focus On</div>
                                            <div className="insight-text">{weakAreas.join(', ')}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Activity Section */}
                        <div className="activity-section">
                            <h3 className="section-title">Recent Activity</h3>
                            {(interviewHistory && interviewHistory.length > 0) ? interviewHistory.slice(0, 5).map((item, index) => (
                                <div className="activity-item" key={index}>
                                    <div className="activity-title">{item.type} Interview Practice</div>
                                    <div className="activity-meta">{item.date} <span className="activity-score">{item.score}%</span></div>
                                </div>
                            )) : <p>No recent activity.</p>}
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="progress-section">
                        <div className="progress-info">
                            <h3>Level 5 Progress</h3>
                            <p>340 / 500 points to Level 6</p>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: '68%' }}></div>
                            </div>
                            <div className="progress-text">68% Complete</div>
                        </div>
                        <div className="progress-emoji">🚀</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-section">
                        <Link to="/history" className="btn btn-secondary">View All Sessions</Link>
                        <Link to="/analytics" className="btn btn-primary">Analytics Dashboard</Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
