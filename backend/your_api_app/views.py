# your_api_app/views.py

import os
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Make sure your AssemblyAI API key is set as an environment variable
ASSEMBLYAI_API_KEY = os.environ.get("ASSEMBLYAI_API_KEY")

@api_view(['POST'])
def get_assemblyai_token(request):
    """
    This view acts as a proxy. It securely requests a token from AssemblyAI
    on behalf of the frontend, avoiding CORS errors.
    """
    if not ASSEMBLYAI_API_KEY:
        return Response(
            {"error": "AssemblyAI API key not configured on the server."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        # Your backend makes the request to AssemblyAI
        response = requests.post(
            'https://api.assemblyai.com/v2/realtime/token',
            json={'expires_in': 3600},
            headers={'authorization': ASSEMBLYAI_API_KEY}
        )
        response.raise_for_status()
        
        # Your backend sends the token back to your React frontend
        return Response(response.json())

    except requests.exceptions.RequestException as e:
        return Response(
            {"error": f"Error calling AssemblyAI: {str(e)}"},
            status=status.HTTP_502_BAD_GATEWAY
        )
