import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './GDWaitingRoom.css';
import { FaUsers, FaLink, FaSpinner } from 'react-icons/fa';

const SOCKET_SERVER_URL = 'http://127.0.0.1:8000';

const GDWaitingRoom = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Get initial room details from the navigation state
    const { roomName, numParticipants } = location.state || {
        roomName: 'Loading Room...',
        numParticipants: 'N/A'
    };

    const [socket, setSocket] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [copySuccess, setCopySuccess] = useState('');
    const inviteLink = `${window.location.origin}/gd/${roomId}`;

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);

        // Join the room as soon as the component mounts
        newSocket.emit('join_room', { roomId });

        // Listen for updates on the participant list
        newSocket.on('participant_update', (data) => {
            setParticipants(data.participants);
        });

        // Listen for the signal to start the GD
        newSocket.on('gd_started', (data) => {
            // Navigate to the actual discussion room with the new topic
            navigate(`/gd/${roomId}`, {
                state: {
                    ...location.state, // Pass along existing state
                    topic: data.topic,
                    duration: data.duration
                }
            });
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
        }, () => {
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
                        <span>{participants.length} / {numParticipants} Participants Joined</span>
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

