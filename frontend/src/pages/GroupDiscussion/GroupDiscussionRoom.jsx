import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import authService from '../../services/authService';
import './GroupDiscussionRoom.css';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaUsers, FaComment, FaHandPaper, FaSignOutAlt, FaPaperPlane, FaCopy, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SOCKET_SERVER_URL = 'http://localhost:8000';

const GroupDiscussionRoom = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { topic, duration } = location.state || { topic: 'General Discussion', duration: 300 };

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [participants, setParticipants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isDiscussionOver, setIsDiscussionOver] = useState(false);
    const [activeTab, setActiveTab] = useState('participants'); // 'participants' or 'chat'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const socketRef = useRef(null);
    const userVideoRef = useRef(null);
    const chatMessagesRef = useRef(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setCurrentUser(user);

        socketRef.current = io(SOCKET_SERVER_URL, {
            query: { token: user.access_token, username: user.username },
        });

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join_room', { room_id: roomId });
        });

        socketRef.current.on('update_participants', (participantList) => {
            setParticipants(participantList);
        });

        socketRef.current.on('new_message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                if (userVideoRef.current) {
                    userVideoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Error accessing media devices.", err);
                setIsVideoOff(true);
                setIsMuted(true);
            });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [roomId, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsDiscussionOver(true);
            if (socketRef.current) socketRef.current.disconnect();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            socketRef.current.emit('send_message', { room_id: roomId, message: newMessage });
            setNewMessage('');
        }
    };

    const handleGenerateFeedback = () => {
        const transcript = messages.map(msg => `${msg.user}: ${msg.text}`).join('\n');
        navigate('/gd-feedback', { state: { transcript } });
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="room-container">
            <header className="room-header">
                {/* A dummy div to balance the flexbox */}
                <div className="header-section header-left"></div>
                <div className="header-section header-center">
                    <h1 className="room-name">{topic}</h1>
                    <p className="topic-display">ID: {roomId}</p>
                </div>
                <div className="header-section header-right">
                    <button className="btn-copy" onClick={() => navigator.clipboard.writeText(roomId)}>
                        <FaCopy /> Copy ID
                    </button>
                    <div className={`timer-display ${isDiscussionOver ? 'finished' : ''}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </header>

            <div className="gd-body">
                <main className="main-content-area">
                    <div className="video-grid">
                        <div className={`video-wrapper ${!isMuted ? 'active-speaker' : ''} ${isVideoOff ? 'video-off' : ''}`}>
                            {isVideoOff ? (
                                <div className="avatar-icon">U</div>
                            ) : (
                                <video ref={userVideoRef} autoPlay muted></video>
                            )}
                            <p>{currentUser?.username} (You)</p>
                            {isHandRaised && <div className="hand-raised-icon"><FaHandPaper /></div>}
                        </div>
                        {/* --- Placeholder Participants for 2x2 Grid --- */}
                        <div className="video-wrapper video-off">
                            <div className="avatar-icon">P2</div>
                            <p>Participant 2</p>
                        </div>
                        <div className="video-wrapper video-off">
                            <div className="avatar-icon">P3</div>
                            <p>Participant 3</p>
                        </div>
                        <div className="video-wrapper video-off">
                            <div className="avatar-icon">P4</div>
                            <p>Participant 4</p>
                        </div>
                    </div>
                </main>

                <aside className={`sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
                    <div className="sidebar-tabs">
                        <button className={activeTab === 'participants' ? 'active' : ''} onClick={() => setActiveTab('participants')}>
                            <FaUsers /> <span className="tab-text">Participants ({participants.length})</span>
                        </button>
                        <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
                            <FaComment /> <span className="tab-text">Chat</span>
                        </button>
                    </div>
                    <div className="sidebar-content">
                        {activeTab === 'participants' && (
                            <div className="participants-list">
                                <h3>Participants</h3>
                                <ul>
                                    {participants.map((p, i) => <li key={i}>{p.username}</li>)}
                                </ul>
                            </div>
                        )}
                        {activeTab === 'chat' && (
                            <div className="chat-box">
                                <ul className="chat-messages" ref={chatMessagesRef}>
                                    {messages.map((msg, index) => (
                                        <li key={index} className={`message ${msg.username === currentUser?.username ? 'my-message' : 'other-message'}`}>
                                            <strong>{msg.username}</strong>
                                            {msg.text}
                                        </li>
                                    ))}
                                </ul>
                                <form className="chat-input-form" onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                    />
                                    <button type="submit"><FaPaperPlane /></button>
                                </form>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <footer className="room-controls">
                <button className={`control-btn ${isMuted ? 'danger' : ''}`} onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                <button className={`control-btn ${isVideoOff ? 'danger' : ''}`} onClick={() => setIsVideoOff(!isVideoOff)}>
                    {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                </button>
                <button className={`control-btn ${isHandRaised ? 'active' : ''}`} onClick={() => setIsHandRaised(!isHandRaised)}>
                    <FaHandPaper />
                </button>
                {isDiscussionOver ? (
                     <button className="control-btn" onClick={handleGenerateFeedback}>
                        <FaPaperPlane />
                    </button>
                ) : (
                    <button className="control-btn danger" onClick={() => navigate('/dashboard')}>
                        <FaSignOutAlt />
                    </button>
                )}
                 <button className="control-btn sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </footer>
        </div>
    );
};

export default GroupDiscussionRoom;