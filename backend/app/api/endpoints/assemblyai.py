import httpx
from ..core.config import settings

async def get_temp_token() -> str:
    """
    Returns the AssemblyAI API key directly for Universal Streaming.
    The new API no longer supports realtime token generation.
    """
    if not settings.ASSEMBLYAI_API_KEY:
        raise ValueError("AssemblyAI API key is missing in environment variables.")

    # The new Universal Streaming endpoint — no token needed
    return {
        "url": "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&model=universal-microphone",
        "api_key": settings.ASSEMBLYAI_API_KEY
    }
