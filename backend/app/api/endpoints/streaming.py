import asyncio
import websockets
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

router = APIRouter()

ASSEMBLYAI_URL_BASE = "wss://api.assemblyai.com/v2/realtime/ws"

@router.websocket("/ws")
async def websocket_proxy(
    client_ws: WebSocket,
    sample_rate: int = Query(16000, description="Sample rate of the audio"),
    token: str = Query(..., description="AssemblyAI temporary token")
):
    """
    Acts as a secure WebSocket proxy to AssemblyAI's real-time streaming service.
    It expects a temporary token from the client to authenticate.
    """
    await client_ws.accept()

    if not token:
        await client_ws.close(code=4001, reason="Not authorized: Token not provided.")
        return

    assemblyai_url_with_token = f"{ASSEMBLYAI_URL_BASE}?sample_rate={sample_rate}&token={token}"

    try:
        # Connect to AssemblyAI using the temporary token from the client
        async with websockets.connect(assemblyai_url_with_token) as assemblyai_ws:
            # Bridge the two WebSockets
            async def forward_to_assembly(client_ws, assemblyai_ws):
                while True:
                    try:
                        message = await client_ws.receive_text()
                        await assemblyai_ws.send(message)
                    except WebSocketDisconnect:
                        break

            async def forward_to_client(client_ws, assemblyai_ws):
                while True:
                    try:
                        message = await assemblyai_ws.recv()
                        await client_ws.send_text(message)
                    except websockets.exceptions.ConnectionClosed:
                        break

            await asyncio.gather(forward_to_assembly(client_ws, assemblyai_ws), forward_to_client(client_ws, assemblyai_ws))

    except (WebSocketDisconnect, websockets.exceptions.ConnectionClosed) as e:
        print(f"WebSocket connection closed: {e}")
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"AssemblyAI connection failed: {e.status_code} {e.headers.get('WWW-Authenticate', '')}")
        await client_ws.close(code=4001, reason=f"AssemblyAI authorization failed: {e.status_code}")
    except Exception as e:
        print(f"An error occurred in the WebSocket proxy: {e}")
        await client_ws.close(code=1011, reason=f"An internal error occurred: {e}")