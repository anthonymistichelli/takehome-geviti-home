"""
Database models for home price predictions.

This module defines the PricePrediction model which stores historical
home price predictions with their input features (square footage, bedrooms)
and the predicted price values.
"""

from django.db import models


class PricePrediction(models.Model):
    """Model to store home price predictions."""
    session_token = models.CharField(max_length=255, default='')
    name = models.CharField(max_length=255, blank=True, default='')
    square_footage = models.FloatField()
    bedrooms = models.IntegerField()
    predicted_price = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Prediction: {self.square_footage} sqft, {self.bedrooms} bed - ${self.predicted_price}"
