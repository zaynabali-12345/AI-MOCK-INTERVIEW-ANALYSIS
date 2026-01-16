from ..core.config import settings

async def get_temp_token() -> dict:
    """
    Returns connection details for AssemblyAI's new Universal Streaming API.
    The old token generation endpoint is deprecated as of 2025.
    """

    if not settings.ASSEMBLYAI_API_KEY:
        raise ValueError("AssemblyAI API key is missing in environment variables.")

    # Universal Streaming model options:
    # - universal-microphone  (for mic input, real-time interviews)
    # - universal-conversational (for conversational speech)
    websocket_url = (
        "wss://api.assemblyai.com/v2/realtime/ws?"
        "sample_rate=16000&model=universal-microphone"
    )

    return {
        "url": websocket_url,
        "api_key": settings.ASSEMBLYAI_API_KEY
    }
