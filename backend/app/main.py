from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from motor.motor_asyncio import AsyncIOMotorClient

from .core.config import settings
from .core.sockets import sio, interview_socket, gd_socket # Import sio from its new central location

# ✅ Initialize FastAPI
app = FastAPI(title="AI Mock Interview API")

# ✅ Define allowed origins for both HTTP and WebSockets
origins = [
    "http://localhost:3000",  # Common React dev server
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Common Vite dev server
    "http://127.0.0.1:5173",
]

# ✅ Database connection
@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(settings.MONGO_DATABASE_URI)
    app.database = app.mongodb_client[settings.MONGO_DATABASE_NAME]
    cache_collection = app.database["interview_reviews_cache"]
    await cache_collection.create_index("created_at", expireAfterSeconds=259200)

# ✅ 1. Add CORS middleware to the FastAPI app first
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 2. Import and register socket events and API routers
from .routers import auth, chatbot, dashboard, resume, hr, interview_review, career_advisor, job_tracker, gd_router, resume_router
from .api.endpoints import streaming

# Register Socket.IO namespaces
sio.register_namespace(interview_socket) # interview_socket is already imported
sio.register_namespace(gd_socket)      # gd_socket is already imported

# Include all API routers in the FastAPI app
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(gd_router.router, prefix="/api/v1", tags=["Group Discussion"]) # This router has its own /gd prefix
app.include_router(hr.router, prefix="/api/v1/hr", tags=["HR Interview"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(interview_review.router, prefix="/api/v1/interview-reviews", tags=["Interview Review"])
app.include_router(resume_router.router, prefix="/api/v1", tags=["Resume Analyzer"]) # Add the new resume router
app.include_router(chatbot.router, prefix="/api/v1/chatbot", tags=["Chatbot"])
app.include_router(streaming.router, prefix="/api/v1/streaming", tags=["Streaming"])
app.include_router(career_advisor.router, prefix="/api/v1/career-path", tags=["Career Advisor"])
app.include_router(job_tracker.router, prefix="/api/v1/job-tracker/rankings", tags=["Job Tracker"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the AI Mock Interview API!"}

# ✅ 3. Finally, wrap the fully configured FastAPI app with the Socket.IO middleware
app = socketio.ASGIApp(sio, app)
