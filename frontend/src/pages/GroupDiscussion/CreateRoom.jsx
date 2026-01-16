import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api'; // Use the centralized API client
import authService from '../../services/authService';
import '../GDLobby.css';

const CreateRoom = () => {
    // State for joining a room
    const [joinRoomId, setJoinRoomId] = useState('');

    // State for creating a room
    const [roomName, setRoomName] = useState('');
    const [numParticipants, setNumParticipants] = useState(4);
    const [difficulty, setDifficulty] = useState('Intermediate');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (!user || !user.access_token) {
            navigate('/login');
            return;
        }

        if (!roomName.trim()) {
            setError('Please enter a room name.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Call the new backend endpoint
            const response = await apiClient.post('/gd/create-room', {
                name: roomName,
                participants: parseInt(numParticipants, 10),
                difficulty: difficulty,
            });
            
            // The backend now only returns room_id. Topic is generated later.
            const { room_id } = response.data;

            // Navigate to the WAITING room, not the discussion room directly.
            navigate(`/gd/wait/${room_id}`, {
                state: {
                    roomName,
                    // We no longer pass the topic, as it's generated later.
                    numParticipants,
                    difficulty,
                }
            });

        } catch (err) {
            console.error("Error creating room:", err);
            const errorMessage = err.response?.data?.detail || 'Failed to create room. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        let roomIdToJoin = joinRoomId.trim();
        if (roomIdToJoin) {
            // Robustness: If the user pastes a full URL, extract just the Room ID.
            const urlParts = roomIdToJoin.split('/');
            const potentialRoomId = urlParts[urlParts.length - 1];
            if (potentialRoomId.startsWith('GD-')) {
                roomIdToJoin = potentialRoomId;
            }

            // When joining, we should also go to the waiting room.
            // The waiting room will fetch the necessary details or get them via socket.
            // We don't pass state because we don't know it when just joining.
            navigate(`/gd/wait/${roomIdToJoin}`);
        }
    };

    return (
        <div className="lobby-container">
            <div className="lobby-card">
                <div className="lobby-section create-room-section">
                    <h2>Create a Discussion Room</h2>
                    <form onSubmit={handleCreateRoom} className="create-form">
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Room Name (e.g., AI Discussion Group)"
                            required
                        />
                        <label>
                            Number of Participants:
                            <input
                                type="number"
                                value={numParticipants}
                                onChange={(e) => setNumParticipants(e.target.value)}
                                min="1"
                                max="10"
                            />
                        </label>
                        <label>
                            Difficulty Level:
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </label>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="btn-create" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create & Start'}
                        </button>
                    </form>
                </div>

                <div className="lobby-separator">OR</div>

                <div className="lobby-section join-room-section">
                    <h2>Join an Existing Room</h2>
                    <form onSubmit={handleJoinRoom} className="join-form">
                        <input
                            type="text"
                            value={joinRoomId}
                            onChange={(e) => setJoinRoomId(e.target.value)}
                            placeholder="Enter Room ID"
                        />
                        <button type="submit">Join Room</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
