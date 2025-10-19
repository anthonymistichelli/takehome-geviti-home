"""
Django app configuration for predictions app.

This module provides the app configuration for the predictions application
including app metadata and default model field configuration.
"""

from django.apps import AppConfig


class PredictionsConfig(AppConfig):
    """Configuration class for the predictions app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'predictions'
