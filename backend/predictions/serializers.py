"""
Serializers for converting PricePrediction model instances to/from JSON.

This module defines the REST API serializers used for serializing
and deserializing home price prediction data.
"""

from rest_framework import serializers
from .models import PricePrediction


class PricePredictionSerializer(serializers.ModelSerializer):
    """
    Serializer for the PricePrediction model.
    
    Converts PricePrediction model instances to JSON and vice versa.
    Handles validation and serialization of prediction data including
    square footage, bedrooms, predicted price, name, session token, and timestamps.
    """
    class Meta:
        model = PricePrediction
        fields = ['id', 'session_token', 'name', 'square_footage', 'bedrooms', 'predicted_price', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
