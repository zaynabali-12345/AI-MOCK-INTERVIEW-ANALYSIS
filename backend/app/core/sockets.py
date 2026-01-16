import socketio

# ✅ Define allowed origins for WebSockets
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# ✅ Create the async Socket.IO server instance here
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=origins)

# --- Namespaces ---
class InterviewNamespace(socketio.AsyncNamespace):
    async def on_connect(self, sid, environ):
        print(f"🔌 Interview socket connected: {sid}")

    async def on_disconnect(self, sid):
        print(f"❌ Interview socket disconnected: {sid}")

class GDNamespace(socketio.AsyncNamespace):
    def __init__(self, namespace):
        super().__init__(namespace)
        self.gd_rooms = {}
        self.MAX_PARTICIPANTS = 1  # Keep at 1 for testing

    async def on_connect(self, sid, environ):
        print(f"🔌 GD socket connected: {sid}")

    async def on_disconnect(self, sid):
        print(f"❌ GD socket disconnected: {sid}")
        for room_id, info in list(self.gd_rooms.items()):
            if sid in info["participants"]:
                info["participants"].remove(sid)
                count = len(info["participants"])
                await self.emit("participant_update", {"count": count}, room=room_id)
                if count == 0:
                    del self.gd_rooms[room_id]
                    print(f"🗑️ Deleted empty room {room_id}")

    async def on_join_room(self, sid, data):
        room_id = data.get("roomId")
        if not room_id:
            print("⚠️ No roomId provided")
            return

        if room_id not in self.gd_rooms:
            self.gd_rooms[room_id] = {"participants": set()}

        await self.enter_room(sid, room_id)
        self.gd_rooms[room_id]["participants"].add(sid)

        count = len(self.gd_rooms[room_id]["participants"])
        print(f"✅ {sid} joined room {room_id} ({count} participants)")
        await self.emit("participant_update", {"count": count}, room=room_id)

        if count >= self.MAX_PARTICIPANTS:
            topic = "The Impact of AI on Future Jobs"
            duration = 5  # minutes
            print(f"🚀 Starting GD for room {room_id}")
            await self.emit("gd_started", {"topic": topic, "duration": duration}, room=room_id)

# --- Instantiate Namespaces ---
interview_socket = InterviewNamespace('/interview')
gd_socket = GDNamespace('/gd')
