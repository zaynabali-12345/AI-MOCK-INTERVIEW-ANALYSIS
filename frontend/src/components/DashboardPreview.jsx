import React, { useState } from 'react';
import { Menu, FileText, Briefcase, Users, User, File, Target } from 'lucide-react';

export default function AIMockInterviewDashboard() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const chartData = [
    { month: 'Jan', value1: 350, value2: 280 },
    { month: 'Feb', value1: 400, value2: 320 },
    { month: 'Mar', value1: 480, value2: 390 },
    { month: 'Apr', value1: 420, value2: 350 },
    { month: 'May', value1: 520, value2: 440 },
    { month: 'Jun', value1: 580, value2: 490 },
    { month: 'Jul', value1: 520, value2: 430 },
    { month: 'Aug', value1: 480, value2: 400 },
    { month: 'Sep', value1: 520, value2: 440 },
    { month: 'Oct', value1: 480, value2: 410 },
    { month: 'Nov', value1: 440, value2: 380 },
    { month: 'Dec', value1: 380, value2: 320 },
  ];

  const barChartData = [120, 180, 140, 220, 380, 320, 240, 180, 200, 160];

  return (
    <div className="dp-container">
      <div className="dp-flex-container">
        {/* Sidebar */}
        <div className="dp-sidebar">
          <div className="dp-sidebar-header">
            <div className="dp-logo-icon-wrapper animate-pulse-slow">
              <Menu size={20} />
            </div>
            <span className="dp-logo-text">Dashboard</span>
          </div>

          <nav className="dp-nav">
            {[
              { name: 'Interview Review', icon: FileText },
              { name: 'Career Advisor', icon: Target },
              { name: 'Job Tracker', icon: Briefcase },
              { name: 'GD Round', icon: Users },
              { name: 'HR Round', icon: User },
              { name: 'Resume Analyzer', icon: File },
            ].map((item, index) => (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`dp-nav-button ${
                  activeMenu === item.name ? 'active' : ''
                }`}
              >
                <item.icon size={14} />
                <span className="dp-nav-text">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="dp-main-content">
          {/* Top Navigation */}
          <div className="dp-top-nav">
            <div className="dp-top-nav-content">
              <div className="dp-top-nav-left">
                <div className="dp-main-logo-wrapper">
                  <span className="dp-main-logo-text">AI</span>
                </div>
                <span className="dp-main-title-text">AI Mock Interview</span>
              </div>
              <nav className="dp-top-nav-links">
                <a href="#home" className="dp-top-nav-link">Home</a>
                <a href="#resume" className="dp-top-nav-link">Resume</a>
                <a href="#features" className="dp-top-nav-link">Features</a>
                <a href="#about" className="dp-top-nav-link">About</a>
                <button className="dp-top-nav-button">
                  Dashboard
                </button>
                <a href="#logout" className="dp-top-nav-link">Logout</a>
                <div className="dp-profile-avatar">
                  MK
                </div>
              </nav>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="dp-content-area">
            {/* Welcome Section */}
            <div className="dp-welcome-section">
              <h1 className="dp-welcome-title">Welcome back, misbha! 👋</h1>
              <p className="dp-welcome-subtitle">Let's continue your interview preparation journey</p>
            </div>

            {/* Action Buttons & Stats */}
            <div className="dp-actions-container">
              <button className="dp-action-btn purple-pink">
                <Target size={18} />
                Start GD Round
              </button>
              <button className="dp-action-btn blue-purple">
                <User size={18} />
                Start HR Round
              </button>
              <div className="dp-stat-badge orange">
                <span className="dp-badge-emoji">🔥</span>
                <span className="dp-badge-text-bold">0</span>
                <span className="dp-badge-text">Streak</span>
              </div>
              <div className="dp-stat-badge yellow">
                <span className="dp-badge-emoji">🏆</span>
                <span className="dp-badge-text-bold">0%</span>
                <span className="dp-badge-text">Best</span>
              </div>
            </div>

            {/* Trophy Icon */}
            <div className="dp-trophy-container">
              <div className="dp-trophy-icon">🏆</div>
            </div>

            {/* Stats Grid */}
            <div className="dp-stats-grid">
              <div className="dp-stat-card">
                <p className="dp-stat-label">Total Sessions</p>
                <p className="dp-stat-value purple">2</p>
              </div>
              <div className="dp-stat-card">
                <p className="dp-stat-label">Avg Score</p>
                <p className="dp-stat-value purple">0%</p>
              </div>
              <div className="dp-stat-card">
                <p className="dp-stat-label">Best Score</p>
                <p className="dp-stat-value green">0%</p>
              </div>
              <div className="dp-stat-card">
                <p className="dp-stat-label">Areas to Improve</p>
                <p className="dp-stat-value orange">2</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="dp-charts-grid">
              {/* Visibility Chart */}
              <div className="dp-chart-card">
                <div className="dp-chart-header">
                  <h3 className="dp-chart-title">Visibility</h3>
                  <p className="dp-chart-subtitle-green">(+5%) more in 2024</p>
                </div>
                <div className="dp-chart-body h-56">
                  <svg className="w-full h-full" viewBox="0 0 400 220">
                    {[0, 100, 200, 300, 400, 500].map((y) => (
                      <line key={y} x1="0" y1={220 - y * 0.4} x2="400" y2={220 - y * 0.4} stroke="#4a1a4d" strokeWidth="1" strokeDasharray="4" />
                    ))}
                    <defs>
                      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M 0 ${220 - chartData[0].value1 * 0.4} ${chartData.map((d, i) => `L ${(i * 400) / 11} ${220 - d.value1 * 0.4}`).join(' ')} L 400 220 L 0 220 Z`}
                      fill="url(#purpleGrad)"
                    />
                    <path
                      d={`M 0 ${220 - chartData[0].value2 * 0.4} ${chartData.map((d, i) => `L ${(i * 400) / 11} ${220 - d.value2 * 0.4}`).join(' ')} L 400 220 L 0 220 Z`}
                      fill="url(#blueGrad)"
                    />
                    <path
                      d={`M 0 ${220 - chartData[0].value1 * 0.4} ${chartData.map((d, i) => `L ${(i * 400) / 11} ${220 - d.value1 * 0.4}`).join(' ')}`}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2"
                    />
                    <path
                      d={`M 0 ${220 - chartData[0].value2 * 0.4} ${chartData.map((d, i) => `L ${(i * 400) / 11} ${220 - d.value2 * 0.4}`).join(' ')}`}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="2"
                    />
                    {chartData.map((d, i) => (
                      <text key={i} x={(i * 400) / 11} y="215" fill="#9ca3af" fontSize="9" textAnchor="middle">
                        {d.month}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* SEO Score */}
              <div className="dp-chart-card">
                <div className="dp-chart-header">
                  <h3 className="dp-chart-title">SEO Score</h3>
                  <p className="dp-chart-subtitle">Basis on daily analysis</p>
                </div>
                <div className="dp-radial-chart-container">
                  <div className="dp-radial-chart">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="#4a1a4d" strokeWidth="8" />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        strokeDasharray="301"
                        strokeDashoffset="60"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="scoreGradient">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="dp-radial-chart-text">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">82%</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Optimised</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dp-radial-chart-footer">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* User Tracking */}
              <div className="dp-chart-card">
                <div className="dp-chart-header-flex">
                  <h3 className="dp-chart-title">User Tracking</h3>
                  <button className="dp-chart-menu">⋮</button>
                </div>
                <div className="dp-user-tracking-main">
                  <div>
                    <p className="dp-chart-subtitle">Active user</p>
                    <p className="text-lg font-bold text-white">14 people</p>
                  </div>
                  <div className="dp-user-tracking-radial">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="35" fill="none" stroke="#4a1a4d" strokeWidth="7" />
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="7"
                        strokeDasharray="220"
                        strokeDashoffset="40"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="dp-radial-chart-text-inner">
                      <p className="text-[9px] text-gray-400">Avg.</p>
                      <p className="text-lg font-bold text-white">9.3</p>
                      <p className="text-[9px] text-gray-400">Daily</p>
                    </div>
                  </div>
                </div>
                <div className="dp-event-section">
                  <p className="dp-chart-subtitle">Event</p>
                  <p className="text-lg font-bold text-white">1,485</p>
                </div>
                <div className="dp-bar-chart-container">
                  {barChartData.map((height, idx) => (
                    <div
                      key={idx}
                      className="dp-bar"
                      style={{ height: `${(height / 400) * 100}%` }}
                    />
                  ))}
                </div>
                <p className="dp-bar-chart-label">Active Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
