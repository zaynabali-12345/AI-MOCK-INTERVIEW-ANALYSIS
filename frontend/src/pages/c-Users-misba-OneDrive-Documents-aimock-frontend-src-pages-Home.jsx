import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import SlideInPanel from '../components/SlideInPanel';
import Logo from '../components/Logo';
import { PanelProvider, usePanel } from './PanelContext';

// Icons
const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m-6-6h6m6 0h6"></path>
  </svg>
);

const ArrowRight = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const HomeContent = () => {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  
  // Auto-typing chat messages
  const messages = [
    "👋 Hi, I’m your AI Interview Coach — ready to ace your next interview?",
    "🎯 Practice real-time HR rounds with instant feedback!",
    "💼 Upload your resume and get AI-powered analysis in seconds.",
    "🗣️ Experience realistic voice-based mock interviews.",
    "📊 Get detailed performance insights and improvement tips.",
    "🚀 Let’s make you interview-ready — anytime, anywhere."
  ];
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [heroAnimationState, setHeroAnimationState] = useState('initial');
  const [isTechSectionVisible, setIsTechSectionVisible] = useState(false);

  // --- Card Slider State ---
  const sliderCards = [
    {
      title: "Boost Your Interview Confidence 💼",
      description: "Practice AI-powered mock interviews anytime, anywhere. Get instant feedback and track your progress across technical, HR, and behavioral rounds.",
      buttonText: "Explore Features",
      icon: "🗣️"
    },
    {
      title: "Personalized AI Feedback 🤖",
      description: "Our AI analyzes your answers in real-time, suggests improvements, and recommends targeted practice areas to boost your interview success.",
      buttonText: "See How It Works",
      icon: "🧠"
    }
  ];

  const techCards = [
    { icon: '🤖', title: 'OpenAI GPT', description: 'Powering realistic HR & GD conversations with state-of-the-art language models.' },
    { icon: '🧠', title: 'Python NLP Engine', description: 'Analyzes resumes and communication tone using advanced natural language processing.' },
    { icon: '🌐', title: 'MERN Stack', description: 'Ensures a seamless and responsive web app experience from front to back.' },
    { icon: '🗣️', title: 'LangChain', description: 'Orchestrates smart, multi-round interview logic for coherent and contextual conversations.' },
    { icon: '📊', title: 'Interview Insights AI', description: 'Tracks confidence, tone, and improvement areas to provide actionable feedback.' }
  ];

  // Typing effect
  useEffect(() => {
    const currentMessage = messages[currentMessageIndex];
    let typingSpeed = 100;

    if (isDeleting) {
      typingSpeed = 50; // Backspace faster
    }

    const typingTimer = setTimeout(() => {
      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentMessage.substring(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }
      } else {
        if (currentText.length < currentMessage.length) {
          setCurrentText(currentMessage.substring(0, currentText.length + 1));
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(typingTimer);
  }, [currentText, isDeleting, currentMessageIndex, messages]);

  // Cursor blinking
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    
    return () => clearInterval(cursorTimer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero animation trigger
  useEffect(() => {
    // 1. After a short delay, start the animation by moving the title to the center.
    const dropInTimer = setTimeout(() => {
      setHeroAnimationState('centered');
    }, 500);

    // 2. After it's centered for 5 seconds, move it to the settled (top-left) position.
    const settleTimer = setTimeout(() => {
      setHeroAnimationState('settled');
    }, 5500); // 500ms initial delay + 5000ms pause

    return () => {
      clearTimeout(dropInTimer);
      clearTimeout(settleTimer);
    };
  }, []);

  // 3D Stacked Card Scroll Effect
  useEffect(() => {
    const cardSection = document.querySelector('.card-slider-section');
    if (!cardSection) return;

    const cards = cardSection.querySelectorAll('.slider-card');
    const cardCount = cards.length;

    const handleScroll = () => {
      const sectionTop = cardSection.offsetTop;
      const sectionHeight = cardSection.offsetHeight;
      const scrollY = window.scrollY;

      // Calculate scroll progress within the section (0 to 1)
      const scrollAmount = scrollY - sectionTop;
      const progress = Math.max(0, Math.min(1, scrollAmount / (sectionHeight - window.innerHeight)));

      cards.forEach((card, index) => {
        const cardOffset = index * 0.05;
        const cardProgress = Math.max(0, progress - cardOffset);
        const scale = 1 - (index * 0.1) + (cardProgress * 0.1);
        const translateY = -index * 40 + cardProgress * 40;
        const opacity = 1 - (index * 0.3) + (cardProgress * 0.3);

        card.style.transform = `translateY(${translateY}vh) scale(${scale})`;
        card.style.opacity = opacity;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sliderCards.length]);

  // Tech Stack Scroll Animation
  useEffect(() => {
    const handleScroll = () => {
      const techSection = document.querySelector('.tech-stack-section');
      if (techSection) {
        const top = techSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        // Trigger when the top of the section is 80% from the top of the viewport
        if (top < windowHeight * 0.8) {
          setIsTechSectionVisible(true);
          // Remove listener after triggering once for performance
          window.removeEventListener('scroll', handleScroll);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check in case the section is already in view on load
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const nextSection = document.querySelector('#chat-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { activePanel, closePanel } = usePanel();

  return (
    <div className="page-container">
      <Navbar />

      {/* Add the Chatbot component here */}
      <Chatbot />

      {/* Features Panel */}
      <SlideInPanel
        isOpen={activePanel === 'features'}
        onClose={closePanel}
        title="Power-Packed Features"
      >
        <h3>💬 AI-Driven Mock Interviews</h3>
        <p>Experience realistic HR and technical interview sessions powered by AI.</p>
        
        <h3>🧠 Resume Analyzer</h3>
        <p>Get instant feedback on your resume—ATS score, keyword insights, and improvement tips.</p>

        <h3>🎙️ GD & HR Simulation</h3>
        <p>Practice communication, confidence, and team discussion scenarios.</p>

        <h3>📊 Personalized Feedback</h3>
        <p>Receive structured analysis on strengths, weaknesses, and next-step recommendations.</p>

        <h3>⚡ Interactive Dashboard</h3>
        <p>Track your progress, past sessions, and skill growth in one place.</p>

        <br/>
        <p><strong>Master every interview with personalized AI guidance and feedback that feels truly human.</strong></p>
      </SlideInPanel>

      {/* About Panel */}
      <SlideInPanel
        isOpen={activePanel === 'about'}
        onClose={closePanel}
        title="About AI Mock Interview"
      >
        <p>
          AI Mock Interview is an intelligent web platform designed to help students and professionals 
          practice and improve their interview skills through simulated, AI-powered sessions.
        </p>
        <p>
          Our mission is to make interview preparation accessible, adaptive, and data-driven.
        </p>
        <p>
          Built with cutting-edge AI & NLP, the system analyzes your responses, evaluates confidence 
          levels, and suggests actionable improvements—making sure you’re ready for real-world interviews.
        </p>
        <br/>
        <p><strong>Your personal AI mentor for smarter, faster, and stress-free interview preparation.</strong></p>
      </SlideInPanel>

      {/* Hero Section */}
      <section className="hero-section" style={{ paddingTop: '80px' }}>

        <div className="hero-content-container">
          <div className={`hero-text-content ${heroAnimationState}`}>
            <h1>AI MOCK INTERVIEW</h1>
            <div className="hero-sub-content">
              <p>
                Practice smarter — simulate real interviews, get instant feedback, and refine your answers with AI-powered insights.
                <br/>
                No mentors, no stress — just you and your AI interviewer. Get interview-ready in minutes.
              </p>
              <div className="hero-buttons">
                <a href="#chat-section" onClick={handleSmoothScroll} className="hero-cta-button primary">
                  Get Started – Free
                </a>
              </div>
            </div>
          </div>
          {/* Spline Model */}
          <div className="hero-spline-container">
            <iframe src='https://my.spline.design/robotfollowcursorforlandingpage-0T0vP3vI4T59Utv6A74la5MA/embed?autoplay=1&logo=0&buttons=0&tooltips=0' frameBorder='0' width='100%' height='100%'></iframe>
          </div>
        </div>
      </section>

      {/* Chat Interface Section */}
      <section id="chat-section" className="chat-interface-section">
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <div className="glass-logo">
              <div className="glass-logo-inner"></div>
            </div>
            <h2>AI Mock Interview</h2>
          </div>
          <ul className="sidebar-menu">
            {['Ethics of AI', 'AI Communication Tool', 'Start a conversation', 'Launch new session'].map((item, idx) => (
              <li key={item} className={idx === 1 ? 'active' : ''}>
                <ChatIcon />
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <main className="chat-main-area">
          <div className="ai-chat-container">
            <div className="ai-chat-header">
              <div className="model-selector">
                <span>GPT 4.5</span>
                <ChevronDown />
              </div>
              <div className="header-icons">
                <GlobeIcon />
                <SettingsIcon />
              </div>
            </div>
            
            <div className="ai-chat-body">
              {displayedMessages.map((msg, idx) => (
                <div key={idx} className="previous-message">{msg}</div>
              ))}
              <div className="current-typing">
                <span>{currentText}</span>
                <span className="blinking-cursor" style={{ opacity: showCursor ? 1 : 0 }}></span>
              </div>
            </div>
            
            <div className="ai-chat-footer">
              <div className="action-tags">
                {['Chat', 'Launch Workflow', 'Data Analysis'].map(tag => (
                  <button key={tag} className="action-tag-button">{tag}</button>
                ))}
              </div>
              <div className="chat-input-bar">
                <input type="text" placeholder="Type your message..." />
                <button className="send-button"><SendIcon /></button>
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* AI Intelligence Section */}
      <section className="ai-intelligence-section">
        <div className="ai-intelligence-content">
          <p className="trusted-by">Trusted by 150,000+ learners and professionals worldwide</p>
          <h2>AI-Driven Interview Intelligence</h2>
          <p>
            Prepare, practice, and perfect your interviews with confidence.
            Our AI Mock Interview platform analyzes your answers, gives real-time feedback, and helps you improve communication, confidence, and content — so you’re truly ready for your dream role.
          </p>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="integrations-section">
        <div className="integrations-wrapper">
          <div className="features-showcase-container">
            {/* First Box: Seamless Conversations */}
            <div className="outer-container integrations-showcase">
                <div className="bg-orb-blue"></div>
                
                <div className="inner-visual-box">
                    <div className="icon-container">
                        <div className="app-icon" title="Gmail">📧</div>
                        <div className="app-icon" title="HubSpot">🎯</div>
                        <div className="app-icon" title="Slack">📊</div>
                        <div className="center-circles">
                            <div className="circle circle-1"></div>
                            <div className="circle circle-2"></div>
                            <div className="circle circle-3"></div>
                            <div className="central-icon">
                                <div className="central-icon-inner"></div>
                            </div>
                        </div>
                        <div className="app-icon" title="Zendesk">⚡</div>
                        <div className="app-icon" title="Salesforce">☁</div>
                        <div className="app-icon" title="WhatsApp">💬</div>
                    </div>
                </div>

                <div className="integrations-content">
                    <h2>Seamless AI-Powered Conversations</h2>
                    <p>Talk, respond, and learn — just like a real interview environment.</p>
                </div>
            </div>

            {/* Second Box: Conversational Actions */}
            <div className="outer-container conversational-actions">
              <div className="bg-orb-blue"></div>
              
              <div className="inner-chat-box">
                  <div className="user-message">
                      <div className="message-bubble">
                          <p>How did I perform on the confidence metric?</p>
                      </div>
                      <div className="user-avatar">👤</div>
                  </div>

                  <div className="ai-response">
                      <div className="ai-icon">✦</div>
                      
                      <div className="response-content">
                          <div className="status-badge">
                              <span>Analysis Complete</span>
                          </div>

                          <div className="info-card">
                              <div className="info-row">
                                  <span>Confidence Score</span>
                                  <strong><span className="highlight">88%</span> (Good)</strong>
                              </div>
                              <div className="info-row">
                                  <span>Clarity & Pace</span>
                                  <strong>Consistent</strong>
                              </div>
                          </div>

                          <div className="email-notice">
                              Detailed report sent to your dashboard.
                          </div>
                      </div>
                  </div>
              </div>

              <div className="content">
                  <h2>Instant Feedback & Performance Tracking</h2>
                  <p>Boost your interview confidence with data-driven insights.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-stack-section">
        <div className="tech-stack-sticky-container">
          <div className="tech-stack-header">
            <h2>Powered by Smart Tech</h2>
          </div>
          <div className={`tech-cards-wrapper ${isTechSectionVisible ? 'is-visible' : ''}`}>
            {techCards.map((card, index) => (
              <div key={index} className="tech-card" style={{ zIndex: index }}>
                <div className="tech-card-icon">{card.icon}</div>
                <div className="tech-card-content">
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Updated "Start Interview" CTA Section */}
      <section className="start-interview-form-section">
        <h2>Ready to Begin?</h2>
        <p>Fill in your details to start a personalized HR interview session.</p>
        <Link to="/hr-form" className="final-cta-button">Start HR Interview</Link>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>Ace Your Next Interview with AI</h2>
        <p className="how-it-works-subheadline">Practice real interview questions with Fusion Mock AI — personalized, instant feedback to help you grow with every session.</p>
        <div className="steps-container">
          <div className="step-card"><h3><span>1️⃣</span> Choose your interview type</h3><p>Select the type of interview you want to practice — HR, technical, behavioral, or role-specific. The platform tailors questions and tone to match real-world interview formats.</p></div>
          <div className="step-card"><h3><span>🤖</span> Practice with AI</h3><p>Engage in a realistic, timed mock interview powered by AI. Receive instant voice or text-based questions just like a real interviewer.</p></div>
          <div className="step-card"><h3><span>✅</span> Get feedback & improve</h3><p>Review your performance with AI-driven analytics on confidence, communication, and content quality. Get detailed suggestions to refine your responses and boost your readiness.</p></div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="final-cta-content">
          <div className="final-cta-logo">
            <Logo />
          </div>
          <h2>Master Every Interview with AI Precision</h2>
          <p>Experience realistic mock interviews powered by AI — personalized questions, instant feedback, and detailed analysis.</p>
          <a href="#chat-section" onClick={handleSmoothScroll} className="final-cta-button">
            Start Free Practice
          </a>
        </div>
      </section>
    </div>
  );
};

const Home = () => {
  return (
    <PanelProvider>
      <HomeContent />
    </PanelProvider>
  );
};

export default Home;
                           