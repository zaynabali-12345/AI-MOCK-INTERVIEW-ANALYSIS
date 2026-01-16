import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './GDWaitingRoom.css';
import { FaUsers, FaLink, FaSpinner } from 'react-icons/fa';

// ✅ Use localhost (not 127.0.0.1) to match your CORS settings
const SOCKET_SERVER_URL = 'http://localhost:8000';

const GDWaitingRoom = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { roomName, numParticipants } = location.state || {
        roomName: 'Loading Room...',
        numParticipants: 'N/A'
    };

    const [participantCount, setParticipantCount] = useState(location.state ? 1 : 0);
    const [copySuccess, setCopySuccess] = useState('');
    const inviteLink = `${window.location.origin}/gd/wait/${roomId}`;

    useEffect(() => {
        // ✅ Force websocket transport to prevent CORS preflight/polling errors
        const newSocket = io(SOCKET_SERVER_URL, {
            transports: ['websocket'],
            withCredentials: true,
        });

        // Listen for participant count updates
        newSocket.on('participant_update', (data) => {
            setParticipantCount(data.count);
        });

        // When GD starts, navigate to discussion room
        newSocket.on('gd_started', (data) => {
            navigate(`/gd-room/${roomId}`, {
                state: {
                    ...location.state,
                    topic: data.topic,
                    duration: data.duration,
                },
            });
        });

        // Join the room after socket connects
        newSocket.on('connect', () => {
            newSocket.emit('join_room', { roomId });
        });

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [roomId, navigate, location.state]);

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }).catch(() => {
            setCopySuccess('Failed to copy');
        });
    };

    return (
        <div className="waiting-room-container">
            <div className="waiting-room-card">
                <h1 className="room-title">{roomName}</h1>
                <p className="room-id">Room ID: {roomId}</p>

                <div className="status-section">
                    <div className="participants-status">
                        <FaUsers className="icon" />
                        <span>{participantCount} / {numParticipants} Participants Joined</span>
                    </div>
                    <div className="invite-link">
                        <FaLink className="icon" />
                        <input type="text" value={inviteLink} readOnly />
                        <button onClick={copyInviteLink}>
                            {copySuccess || 'Copy Link'}
                        </button>
                    </div>
                </div>

                <div className="waiting-message">
                    <FaSpinner className="spinner-icon" />
                    <h2>Waiting for all participants to join...</h2>
                    <p>The group discussion will begin automatically once the room is full.</p>
                </div>
            </div>
        </div>
    );
};

export default GDWaitingRoom;
