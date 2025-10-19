"""
Home price prediction using Linear Regression.
Model trained on historical housing data with square footage and bedrooms as features.
"""

import numpy as np
from sklearn.linear_model import LinearRegression

import pickle
import os

# Training data: List of dictionaries with provided housing data
training_data = [
    {'sq_footage': 800, 'bedrooms': 2, 'price': 150000},
    {'sq_footage': 1200, 'bedrooms': 3, 'price': 200000},
    {'sq_footage': 1500, 'bedrooms': 3, 'price': 250000},
    {'sq_footage': 1800, 'bedrooms': 4, 'price': 300000},
    {'sq_footage': 2000, 'bedrooms': 4, 'price': 320000},
    {'sq_footage': 2200, 'bedrooms': 5, 'price': 360000},
    {'sq_footage': 2400, 'bedrooms': 4, 'price': 380000},
    {'sq_footage': 2600, 'bedrooms': 5, 'price': 400000},
]

# Extract features and target from training data
X_train = np.array([[data['sq_footage'], data['bedrooms']] for data in training_data])
y_train = np.array([data['price'] for data in training_data])

# Train the Linear Regression model
_model = LinearRegression()
_model.fit(X_train, y_train)


def predict_home_price(square_footage: float, bedrooms: int) -> float:
    """
    Predict home price using Linear Regression model trained on historical data.
    
    Model features:
    - Square footage of the home
    - Number of bedrooms
    
    Trained on 8 historical housing transactions.
    
    Args:
        square_footage: The square footage of the home
        bedrooms: The number of bedrooms

    Returns:
        Predicted price as a float
    """
    # Prepare features for prediction
    features = np.array([[square_footage, bedrooms]])
    
    # Make prediction with LinearRegression model
    predicted_price = _model.predict(features)[0]
    
    # Ensure price is non-negative
    return max(0, float(predicted_price))
