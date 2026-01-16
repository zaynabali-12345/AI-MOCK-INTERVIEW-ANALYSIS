# c/Users/misba/OneDrive/Documents/aimock/backend/app/routers/gd_router.py

import asyncio
from fastapi.exceptions import HTTPException
import uuid
import logging
from fastapi import APIRouter
from pydantic import BaseModel

# Import 'sio' from its original source to avoid circular imports
from ..core.sockets import sio
# ✅ Import the real Gemini topic generator
from ..services.discussion_service import generate_discussion_topic
from ..services.feedback_service import generate_gd_feedback

# --- In-Memory Storage for Rooms ---
rooms = {}

# --- Pydantic Models ---
class CreateRoomRequest(BaseModel):
    name: str
    participants: int
    difficulty: str

class CreateRoomResponse(BaseModel):
    room_id: str


# --- API Router ---
router = APIRouter(
    prefix="/gd",
    tags=["Group Discussion"],
)


# --- Helper ---
def generate_room_id():
    """Generates a unique room ID."""
    return f"GD-{uuid.uuid4().hex[:5].upper()}"


# --- API Endpoint ---
@router.post("/create-room", response_model=CreateRoomResponse)
async def create_room(request: CreateRoomRequest):
    """Creates a new Group Discussion room."""
    room_id = generate_room_id()

    rooms[room_id] = {
        "name": request.name,
        "required_participants": request.participants,
        "difficulty": request.difficulty,
        "participants": set(),
        "status": "waiting",
        "topic": None,
    }
    logging.info(f"Room created: {room_id} with data {rooms[room_id]}")
    return CreateRoomResponse(room_id=room_id)


# --- SOCKET.IO HANDLERS ---
@sio.on('join_room')
async def handle_join_room(sid, data):
    """Handles user joining a room and starts GD when full."""
    room_id = data.get('roomId')
    if not room_id or room_id not in rooms:
        logging.warning(f"User {sid} tried to join non-existent room {room_id}")
        return

    room = rooms[room_id]
    await sio.enter_room(sid, room_id)
    room["participants"].add(sid)

    logging.info(f"User {sid} joined room {room_id}. Participants: {len(room['participants'])}/{room['required_participants']}")

    # Broadcast updated participant count
    await sio.emit('participant_update', {
        'participants': list(room["participants"]),
        'count': len(room["participants"])
    }, room=room_id)

    # ✅ When room full → generate topic using Gemini API
    if len(room["participants"]) == room["required_participants"] and room["status"] == "waiting":
        room["status"] = "in_progress"

        logging.info(f"Room {room_id} full. Generating GD topic using Gemini...")
        topic_data = generate_discussion_topic()  # ← Synchronous call
        topic = topic_data.get("topic", "Topic unavailable due to API error.")
        room["topic"] = topic

        logging.info(f"Room {room_id} topic generated: {room['topic']}")

        # Broadcast GD start
        await sio.emit('gd_started', {
            'topic': room['topic'],
            'duration': 300  # 5 minutes
        }, room=room_id)
        return

    # --- WebRTC signaling ---
    existing_sids = list(room["participants"] - {sid})
    if existing_sids:
        await sio.emit('existing_users', {'sids': existing_sids}, to=sid)

    await sio.emit('user_joined', {'sid': sid}, room=room_id, skip_sid=sid)


@sio.on('disconnect')
async def handle_disconnect(sid):
    """Removes user from rooms when disconnected."""
    for room_id, room in rooms.items():
        if sid in room["participants"]:
            room["participants"].remove(sid)

            await sio.emit('participant_update', {
                'participants': list(room["participants"]),
                'count': len(room["participants"])
            }, room=room_id)

            logging.info(f"User {sid} disconnected from room {room_id}")
            await sio.emit('user_left', {'sid': sid}, room=room_id, skip_sid=sid)
            break

class FeedbackRequest(BaseModel):
    transcript: str

@router.post("/feedback")
async def get_feedback(request: FeedbackRequest):
    """
    Receives a transcript (from chat or speech) and returns AI-generated feedback.
    """
    try:
        if not request.transcript or not request.transcript.strip():
            raise HTTPException(status_code=400, detail="Transcript cannot be empty.")
        feedback_data = await generate_gd_feedback(request.transcript)
        return feedback_data
    except Exception as e:
        logging.error(f"Error generating GD feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))
