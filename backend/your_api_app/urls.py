# your_api_app/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # ... your other url patterns like '/hr/respond' might be here
    # Assuming your hr/respond is also under api/v1/
    path('api/v1/hr/respond', views.your_hr_respond_view, name='hr_respond'), # Update this line if it exists
    path('api/v1/assemblyai/token', views.get_assemblyai_token, name='assemblyai_token'),
]
