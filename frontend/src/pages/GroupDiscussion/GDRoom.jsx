import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import './GDRoom.css'; // We'll create this CSS file next
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaUser, FaHandPaper, FaPhoneSlash, FaComment, FaPaperPlane } from 'react-icons/fa';

const SOCKET_SERVER_URL = 'http://127.0.0.1:8000';

const GDRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get topic and roomName from navigation state
    const { topic, roomName } = location.state || { topic: 'No topic loaded.', roomName: 'Discussion Room' };

    const [socket, setSocket] = useState(null);
    const [peers, setPeers] = useState({});
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeSpeaker, setActiveSpeaker] = useState(null);
    const [sidebarTab, setSidebarTab] = useState('participants'); // 'participants' or 'chat'
    const [messages, setMessages] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [chatInput, setChatInput] = useState('');
    const [typingUsers, setTypingUsers] = useState({});
    const [copySuccess, setCopySuccess] = useState('');

    const localVideoRef = useRef();
    const localStreamRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const peerConnections = useRef({});
    const audioAnalyzers = useRef({});

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setupAudioAnalysis(stream, newSocket.id);
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                newSocket.emit('join_room', { roomId });

                newSocket.on('existing_users', ({ sids }) => {
                    sids.forEach(existingSid => {
                        const pc = createPeerConnection(existingSid, stream, newSocket);
                        peerConnections.current[existingSid] = pc;
                        pc.createOffer()
                            .then(offer => pc.setLocalDescription(offer))
                            .then(() => {
                                newSocket.emit('offer', { sdp: pc.localDescription, roomId, to: existingSid });
                            });
                    });
                });

                newSocket.on('user_joined', ({ sid }) => {
                    const pc = createPeerConnection(sid, stream, newSocket);
                    peerConnections.current[sid] = pc;
                    pc.createOffer()
                        .then(offer => pc.setLocalDescription(offer))
                        .then(() => {
                            newSocket.emit('offer', { sdp: pc.localDescription, roomId, to: sid });
                        });
                });

                newSocket.on('offer', ({ sdp, sid }) => {
                    if (sid !== newSocket.id) {
                        const pc = createPeerConnection(sid, stream, newSocket);
                        peerConnections.current[sid] = pc;
                        pc.setRemoteDescription(new RTCSessionDescription(sdp))
                            .then(() => pc.createAnswer())
                            .then(answer => pc.setLocalDescription(answer))
                            .then(() => {
                                newSocket.emit('answer', { sdp: pc.localDescription, roomId, to: sid });
                            });
                    }
                });

                newSocket.on('answer', ({ sdp, sid }) => {
                    const pc = peerConnections.current[sid];
                    if (pc) {
                        pc.setRemoteDescription(new RTCSessionDescription(sdp));
                    }
                });

                newSocket.on('ice_candidate', ({ candidate, sid }) => {
                    const pc = peerConnections.current[sid];
                    if (pc && candidate) {
                        pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                });

                newSocket.on('hand_status_changed', ({ sid, isRaised }) => {
                    setPeers(prev => {
                        if (!prev[sid]) return prev;
                        return { ...prev, [sid]: { ...prev[sid], handRaised: isRaised } };
                    });
                });

                newSocket.on('video_status_changed', ({ sid, isOff }) => {
                    setPeers(prev => {
                        if (!prev[sid]) return prev;
                        return { ...prev, [sid]: { ...prev[sid], isVideoOff: isOff } };
                    });
                });

                newSocket.on('user_left', ({ sid }) => {
                    if (peerConnections.current[sid]) {
                        peerConnections.current[sid].close();
                        delete peerConnections.current[sid];
                    }
                    setPeers(prev => {
                        const newPeers = { ...prev };
                        delete newPeers[sid];
                        return newPeers;
                    });
                });

                newSocket.on('receive_message', ({ message, sid }) => {
                    const newMessage = { text: message, sender: `User ${sid.substring(0, 4)}`, sid };
                    setMessages(prev => [...prev, newMessage]);
                    if (!showSidebar || sidebarTab !== 'chat') {
                        setUnreadMessages(count => count + 1);
                    }
                });

                newSocket.on('user_typing_start', ({ sid }) => {
                    setTypingUsers(prev => ({ ...prev, [sid]: true }));
                });

                newSocket.on('user_typing_stop', ({ sid }) => {
                    setTypingUsers(prev => {
                        const newTypingUsers = { ...prev };
                        delete newTypingUsers[sid];
                        return newTypingUsers;
                    });
                });
            })
            .catch(error => console.error("Error accessing media devices.", error));

        return () => {
            newSocket.disconnect();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            Object.values(audioAnalyzers.current).forEach(analyzer => {
                analyzer.interval && clearInterval(analyzer.interval);
                analyzer.audioContext?.close();
            });
            Object.values(peerConnections.current).forEach(pc => pc.close());
        };
    }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

    const createPeerConnection = (targetSid, localStream, socketInstance) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.onicecandidate = event => {
            if (event.candidate) {
                socketInstance.emit('ice_candidate', { candidate: event.candidate, roomId, to: targetSid });
            }
        };

        pc.ontrack = event => {
            setPeers(prevPeers => ({
                ...prevPeers,
                [targetSid]: { stream: event.streams[0], handRaised: false, isVideoOff: false }
            }));
            setupAudioAnalysis(event.streams[0], targetSid);
        };

        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });

        return pc;
    };

    const setupAudioAnalysis = (stream, sid) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 512;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const interval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

            if (average > 20) {
                setActiveSpeaker(currentSpeaker => {
                    if (currentSpeaker !== sid) return sid;
                    return currentSpeaker;
                });
            }
        }, 200);

        audioAnalyzers.current[sid] = { audioContext, interval };
    };

    const toggleAudio = () => {
        localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMuted(prev => !prev);
    };

    const toggleVideo = () => {
        localStreamRef.current.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            const newIsVideoOff = !track.enabled;
            setIsVideoOff(newIsVideoOff);
            socket?.emit('video_status_changed', { isOff: newIsVideoOff });
            if (!newIsVideoOff && localVideoRef.current) {
                localVideoRef.current.play().catch(e => console.error("Video play failed", e));
            }
        });
    };

    const toggleHandRaise = () => {
        const newIsHandRaised = !isHandRaised;
        setIsHandRaised(newIsHandRaised);
        socket?.emit('raise_hand', { isRaised: newIsHandRaised });
    };

    const handleChatInputChange = (e) => {
        setChatInput(e.target.value);
        if (!typingTimeoutRef.current) {
            socket?.emit('typing_start');
        } else {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            socket?.emit('typing_stop');
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (chatInput.trim() && socket) {
            const newMessage = { text: chatInput, sender: 'You', sid: socket.id };
            setMessages(prev => [...prev, newMessage]);
            socket.emit('send_message', { message: chatInput });
            setChatInput('');
        }
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('Failed to copy');
        });
    };

    const leaveMeeting = () => {
        socket?.disconnect();
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        Object.values(peerConnections.current).forEach(pc => pc.close());
        setTimeout(() => navigate('/'), 100);
    };

    const handleSidebarToggle = () => {
        if (!showSidebar) {
            setUnreadMessages(0);
        }
        setShowSidebar(p => !p);
    };

    return (
        <div className="room-container">
            <div className="room-header">
                <div className="room-title-container">
                    <h2>{roomName}</h2>
                    <p className="topic-display">
                        <strong>Topic:</strong> {topic}
                    </p>
                </div>
                <div className="room-info">
                    <button onClick={copyInviteLink} className="btn-copy">
                        {copySuccess || '🔗 Copy Invite Link'}
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div className={`video-grid video-count-${Object.keys(peers).length + 1}`}>
                    <div className={`video-wrapper ${activeSpeaker === socket?.id ? 'active-speaker' : ''} ${isVideoOff ? 'video-off' : ''}`}>
                        {isHandRaised && <div className="hand-raised-icon">✋</div>}
                        {isVideoOff ? <div className="avatar-icon"><FaUser /></div> : <video ref={localVideoRef} autoPlay playsInline muted />}
                        <p>You</p>
                    </div>
                    {Object.entries(peers).map(([sid, peer]) => (
                        <div key={sid} className={`video-wrapper ${activeSpeaker === sid ? 'active-speaker' : ''} ${peer.isVideoOff ? 'video-off' : ''}`}>
                            {peer.handRaised && <div className="hand-raised-icon">✋</div>}
                            {peer.isVideoOff ? <div className="avatar-icon"><FaUser /></div> : (
                                <video
                                    ref={videoEl => { if (videoEl && peer.stream) videoEl.srcObject = peer.stream; }}
                                    autoPlay
                                    playsInline
                                />
                            )}
                            <p>User {sid.substring(0, 4)}</p>
                        </div>
                    ))}
                </div>

                <div className={`sidebar ${showSidebar ? 'show' : ''}`}>
                    <div className="sidebar-tabs">
                        <button onClick={() => setSidebarTab('participants')} className={sidebarTab === 'participants' ? 'active' : ''}>Participants</button>
                        <button onClick={() => setSidebarTab('chat')} className={sidebarTab === 'chat' ? 'active' : ''}>Chat</button>
                    </div>
                    <div className="sidebar-content">
                        {sidebarTab === 'participants' && (
                            <div className="participants-list">
                                <h3>Participants ({Object.keys(peers).length + 1})</h3>
                                <ul>
                                    <li className={activeSpeaker === socket?.id ? 'active' : ''}>
                                        <span className="speaker-icon">🟢</span> You
                                    </li>
                                    {Object.keys(peers).map(sid => (
                                        <li key={sid} className={activeSpeaker === sid ? 'active' : ''}>
                                            <span className="speaker-icon">🟢</span> User {sid.substring(0, 4)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {sidebarTab === 'chat' && (
                            <div className="chat-box">
                                <h3>Chat</h3>
                                <ul className="chat-messages">
                                    {messages.map((msg, index) => (
                                        <li key={index} className={`message ${msg.sid === socket?.id ? 'my-message' : 'other-message'}`}>
                                            <strong>{msg.sender}:</strong> {msg.text}
                                        </li>
                                    ))}
                                </ul>
                                <div className="typing-indicator">
                                    {Object.keys(typingUsers).length > 0 && (
                                        <span>
                                            {Object.keys(typingUsers).map(sid => `User ${sid.substring(0, 4)}`).join(', ')} is typing...
                                        </span>
                                    )}
                                </div>
                                <form className="chat-input-form" onSubmit={handleSendMessage}>
                                    <input type="text" value={chatInput} onChange={handleChatInputChange} placeholder="Type a message..." />
                                    <button type="submit" aria-label="Send Message"><FaPaperPlane /></button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="room-controls">
                <button onClick={toggleAudio} className={`control-btn ${isMuted ? 'danger' : ''}`} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                <button onClick={toggleVideo} className={`control-btn ${isVideoOff ? 'danger' : ''}`} aria-label={isVideoOff ? 'Start Video' : 'Stop Video'}>
                    {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                </button>
                <button onClick={handleSidebarToggle} className={`control-btn ${showSidebar ? 'active' : ''}`} aria-label="Show sidebar">
                    <FaComment />
                    {unreadMessages > 0 && !showSidebar && (
                        <span className="notification-badge">{unreadMessages}</span>
                    )}
                </button>
                <button onClick={toggleHandRaise} className={`control-btn ${isHandRaised ? 'active' : ''}`} aria-label="Raise Hand">
                    <FaHandPaper />
                </button>
                <button onClick={leaveMeeting} className="control-btn leave-btn" aria-label="Leave Meeting">
                    <FaPhoneSlash />
                </button>
            </div>
        </div>
    );
};

export default GDRoom;