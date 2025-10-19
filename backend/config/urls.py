"""
URL configuration for home price prediction project.
"""
from django.urls import path, include

urlpatterns = [
    path('api/predictions/', include('predictions.urls')),
]
