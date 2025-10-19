"""
URL routing for predictions app.

This module defines all URL patterns for the predictions API including
CRUD endpoints for predictions and admin authentication/management endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PricePredictionViewSet,
    session_predictions,
    session_update_prediction,
    session_delete_prediction
)

router = DefaultRouter()
router.register(r'', PricePredictionViewSet, basename='prediction')

urlpatterns = [
    path('session-data/', session_predictions, name='session-data'),
    path('session-update/<int:pk>/', session_update_prediction, name='session-update'),
    path('session-delete/<int:pk>/', session_delete_prediction, name='session-delete'),
    path('', include(router.urls)),
]
