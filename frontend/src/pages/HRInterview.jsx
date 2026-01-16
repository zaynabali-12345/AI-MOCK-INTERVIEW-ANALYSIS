import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { FaMicrophone, FaSpinner, FaUser, FaPhoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import './HRInterview.css';


const HRInterview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const formData = location.state; // Correctly get the whole state object

    const [conversationHistory, setConversationHistory] = useState([]);
    const [isAIResponding, setIsAIResponding] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [interviewId, setInterviewId] = useState(null);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');

    const audioRef = useRef(null);
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const recognitionRef = useRef(null);
    const silenceTimeoutRef = useRef(null);

    // Effect to start the interview
    useEffect(() => {
        if (!formData) {
            navigate('/');
            return;
        }

        const startInterview = async () => {
            setIsAIResponding(true);
            try {
                const response = await apiClient.post('/hr/respond', {
                    ...formData,
                    conversation: [],
                });
                const { text, audio, interview_id } = response.data;
                setConversationHistory([{ speaker: 'HR', text }]);
                setInterviewId(interview_id);
                playAudioAndListen(audio);
            } catch (error) {
                console.error("Error starting interview:", error);
                alert("Could not start the interview. Please try again.");
                navigate('/');
            } finally {
                setIsAIResponding(false);
            }
        };

        startInterview();
    }, [formData, navigate]);

    const sendResponseToBackend = async (userText) => {
        if (!userText) return;
        setIsAIResponding(true);
        setIsRecording(false); // Stop listening indicator

        const newHistory = [...conversationHistory, { speaker: 'User', text: userText }];
        setConversationHistory(newHistory);

        try {
            const response = await apiClient.post('/hr/respond', {
                ...formData,
                conversation: newHistory,
                interview_id: interviewId,
            });
            const { text, audio } = response.data;

            // Check if the interview is over
            if (text.toLowerCase().includes("thank you for your time")) {
                setConversationHistory(prev => [...prev, { speaker: 'HR', text }]);
                // Don't start listening again
            } else {
                setConversationHistory(prev => [...prev, { speaker: 'HR', text }]);
                playAudioAndListen(audio);
            }
        } catch (error) {
            console.error("Error getting AI response:", error);
            alert("An error occurred while getting the AI's response.");
        } finally {
            setIsAIResponding(false);
        }
    };

    // Effect to manage local video stream and ensure it's always muted
    useEffect(() => {
        const videoElement = localVideoRef.current;
        if (!videoElement) return;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStreamRef.current = stream;
                videoElement.srcObject = stream;
                videoElement.muted = true;
            }).catch(err => console.error("Error accessing media devices.", err));

        const handleVolumeChange = () => {
            if (videoElement && !videoElement.muted) {
                videoElement.muted = true;
            }
        };
        videoElement.addEventListener('volumechange', handleVolumeChange);

        return () => {
            videoElement.removeEventListener('volumechange', handleVolumeChange);
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Effect for setting up Web Speech API
    useEffect(() => {
        // Use a ref to hold the current transcript to avoid stale closures in event handlers
        const userTranscriptRef = { current: '' };

        if (!('webkitSpeechRecognition' in window)) {
            console.warn("Speech recognition not supported.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // Show interim results for better UX
            userTranscriptRef.current = (finalTranscript + interimTranscript);
            setUserTranscript(userTranscriptRef.current);
        };

        recognition.onspeechend = () => {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = setTimeout(() => {
                const finalTranscript = userTranscriptRef.current.trim();
                if (finalTranscript) {
                    sendResponseToBackend(finalTranscript);
                    userTranscriptRef.current = ''; // Reset ref
                    setUserTranscript(''); // Reset transcript after sending
                }
            }, 2500); // 2.5-second pause to detect end of speech
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            // Handle the "no-speech" error gracefully by restarting recognition
            if (event.error === 'no-speech' && !isAIResponding) {
                console.log("No speech detected, restarting recognition...");
                recognition.start();
            }
        };
        recognitionRef.current = recognition;

        // The recognition service is started/stopped by the AI's state
        return () => recognition.stop();
    }, [isAIResponding]); // Rerun if AI state changes, to ensure correct error handling context

    const handleFinishInterview = async () => {
        if (!interviewId) {
            alert("No interview session to finish.");
            return;
        }
        try {
            navigate(`/hr-feedback/${interviewId}`);
        } catch (error) {
            console.error("Error navigating to feedback page:", error);
            alert("Could not retrieve feedback. Please try again later.");
        }
    };

    const handleEndCall = () => {
        // Stop all media tracks and recognition
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        // Navigate back to the form page
        navigate('/hr-form');
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(prev => !prev);
        }
    };

    const playAudioAndListen = (audioBase64) => {
        const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
        if (audioRef.current) {
            audioRef.current.pause();
        }
        audioRef.current = new Audio(audioSrc);
        audioRef.current.play();
        setIsAIResponding(true);

        // Stop listening while AI is talking
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }

        setUserTranscript(''); // Clear any partial transcript

        audioRef.current.onended = handleAudioEnded;
    };

    const handleAudioEnded = () => {
        setIsAIResponding(false);
        // After AI finishes speaking, start listening for the user's response.
        if (conversationHistory.length < 6) { // 3 questions from HR + 3 answers from user
            console.log("AI finished speaking, now listening for user response...");
            if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsRecording(true);
            }
        }
    };

    const isInterviewFinished = conversationHistory.some(msg =>
        msg.speaker === 'HR' && msg.text.toLowerCase().includes("thank you for your time")
    );

    // Don't render anything until the form data is confirmed to be present.
    if (!formData) {
        return null;
    }

    return (
        <div className="hr-interview-page">
            <div className={`video-container ${isVideoOff ? 'video-off' : ''}`}>
                {isVideoOff ? (
                    <div className="avatar-placeholder">
                        <FaUser />
                    </div>
                ) : (
                    <video ref={localVideoRef} autoPlay playsInline muted />
                )}
                <div className="video-overlay">
                    <div className="hr-avatar">
                        <FaUser />
                    </div>
                    <h3>{formData?.name || 'Candidate'}</h3>
                </div>
                <div className="video-controls-overlay">
                    <button onClick={toggleVideo} className={`control-btn ${isVideoOff ? 'danger' : ''}`}>
                        {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                    </button>
                    <button onClick={handleEndCall} className="control-btn danger"><FaPhoneSlash /></button>
                </div>
            </div>
            <div className="interview-panel">
                <div className="interview-header">
                    <h2>HR Interview</h2>
                    <p>Role: {formData?.role?.replace(/_/g, ' ') || 'N/A'}</p>
                </div>
                <div className="interview-controls">
                    <button className={`record-btn ${isRecording ? 'recording' : ''}`} disabled>
                        <FaMicrophone />
                    </button>
                    <span>{isRecording ? 'Listening...' : (isAIResponding ? 'AI is speaking...' : 'Ready')}</span>
                </div>
                <div className="transcript-container">
                    {conversationHistory.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.speaker.toLowerCase()}`}>
                            <div className="message-content">
                                <strong>{msg.speaker === 'user' ? 'You' : 'Alex (HR)'}:</strong>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {userTranscript && (
                        <p className="user-transcript-preview">You: <em>{userTranscript}...</em></p>
                    )}
                    {isAIResponding && <FaSpinner className="fa-spin" />}
                </div>
                <div className="finish-interview-container">
                    {isInterviewFinished ? (
                        <button onClick={handleFinishInterview} className="finish-btn">
                            View Feedback
                        </button>
                    ) : null}
                </div>
            </div>
            <audio ref={audioRef} onEnded={handleAudioEnded} style={{ display: 'none' }} />
        </div>
    );
};

export default HRInterview;
