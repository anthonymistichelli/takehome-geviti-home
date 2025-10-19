"""
Unit tests for predictions app.

This module contains comprehensive test suites for:
- PricePrediction model and its methods
- predict_home_price machine learning function
- REST API endpoints for CRUD operations with session-based access
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import PricePrediction
from .predictor import predict_home_price


class PredictorTests(TestCase):
    """Tests for the prediction model"""

    def test_predict_home_price_with_valid_inputs(self):
        """Test that predict_home_price returns a float"""
        price = predict_home_price(2000, 3)
        self.assertIsInstance(price, (float, int))
        self.assertGreater(price, 0)

    def test_predict_home_price_small_home(self):
        """Test prediction for a small home"""
        price = predict_home_price(800, 2)
        self.assertIsInstance(price, (float, int))
        self.assertGreater(price, 0)

    def test_predict_home_price_large_home(self):
        """Test prediction for a large home"""
        price = predict_home_price(3000, 5)
        self.assertIsInstance(price, (float, int))
        self.assertGreater(price, 0)

    def test_predict_home_price_increases_with_sqft(self):
        """Test that price increases with square footage"""
        price_small = predict_home_price(1000, 3)
        price_large = predict_home_price(2000, 3)
        self.assertGreater(price_large, price_small)

    def test_predict_home_price_increases_with_bedrooms(self):
        """Test that price increases with number of bedrooms"""
        price_2bed = predict_home_price(2000, 2)
        price_4bed = predict_home_price(2000, 4)
        self.assertGreater(price_4bed, price_2bed)


class PricePredictionModelTests(TestCase):
    """Tests for the PricePrediction model"""

    def setUp(self):
        """Create a test prediction"""
        self.prediction = PricePrediction.objects.create(
            session_token='test-session-123',
            name='Test Home',
            square_footage=2000,
            bedrooms=3,
            predicted_price=450000,
        )

    def test_prediction_creation(self):
        """Test that a prediction can be created"""
        self.assertEqual(self.prediction.square_footage, 2000)
        self.assertEqual(self.prediction.bedrooms, 3)
        self.assertEqual(self.prediction.predicted_price, 450000)
        self.assertEqual(self.prediction.name, 'Test Home')

    def test_prediction_has_timestamps(self):
        """Test that predictions have created_at and updated_at"""
        self.assertIsNotNone(self.prediction.created_at)
        self.assertIsNotNone(self.prediction.updated_at)

    def test_prediction_str_representation(self):
        """Test string representation of prediction"""
        self.assertIn("2000", str(self.prediction))
        self.assertIn("3 bed", str(self.prediction))


class SessionPredictionAPITests(TestCase):
    """Tests for session-based Predictions API endpoints"""

    def setUp(self):
        """Initialize API client and test data"""
        self.client = APIClient()
        self.api_url = reverse('prediction-list')
        
        # Create sample predictions with session tokens
        self.session_1 = 'session-1'
        self.session_2 = 'session-2'
        
        self.prediction1 = PricePrediction.objects.create(
            session_token=self.session_1,
            name='Prediction 1',
            square_footage=1500,
            bedrooms=3,
            predicted_price=350000,
        )
        self.prediction2 = PricePrediction.objects.create(
            session_token=self.session_2,
            name='Prediction 2',
            square_footage=2500,
            bedrooms=4,
            predicted_price=500000,
        )

    def test_create_prediction_valid(self):
        """Test creating a prediction with valid data"""
        data = {
            'session_token': 'session-test-123',
            'name': 'New Home',
            'square_footage': 2000,
            'bedrooms': 3,
        }
        response = self.client.post(self.api_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['session_token'], 'session-test-123')
        self.assertEqual(response.data['square_footage'], 2000)
        self.assertEqual(response.data['bedrooms'], 3)
        self.assertIn('predicted_price', response.data)
        self.assertGreater(response.data['predicted_price'], 0)

    def test_create_prediction_missing_session_token(self):
        """Test creating prediction without session_token"""
        data = {
            'square_footage': 2000,
            'bedrooms': 3,
        }
        response = self.client.post(self.api_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_prediction_missing_square_footage(self):
        """Test creating prediction without square_footage"""
        data = {
            'session_token': 'session-123',
            'bedrooms': 3,
        }
        response = self.client.post(self.api_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_prediction_missing_bedrooms(self):
        """Test creating prediction without bedrooms"""
        data = {
            'session_token': 'session-123',
            'square_footage': 2000,
        }
        response = self.client.post(self.api_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_prediction_negative_square_footage(self):
        """Test creating prediction with negative square footage"""
        data = {
            'session_token': 'session-123',
            'square_footage': -1000,
            'bedrooms': 3,
        }
        response = self.client.post(self.api_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_prediction_negative_bedrooms(self):
        """Test creating prediction with negative bedrooms"""
        data = {
            'session_token': 'session-123',
            'square_footage': 2000,
            'bedrooms': -1,
        }
        response = self.client.post(self.api_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_prediction_square_footage_exceeds_max(self):
        """Test creating prediction with square footage exceeding 500,000 limit"""
        data = {
            'session_token': 'session-123',
            'square_footage': 500001,
            'bedrooms': 3,
        }
        response = self.client.post(self.api_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot exceed 500,000', response.data['error'])

    def test_create_prediction_bedrooms_exceeds_max(self):
        """Test creating prediction with bedrooms exceeding 300 limit"""
        data = {
            'session_token': 'session-123',
            'square_footage': 2000,
            'bedrooms': 301,
        }
        response = self.client.post(self.api_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot exceed 300', response.data['error'])

    def test_create_prediction_max_limits_allowed(self):
        """Test creating prediction at the max limits (should succeed)"""
        data = {
            'session_token': 'session-123',
            'square_footage': 500000,
            'bedrooms': 300,
        }
        response = self.client.post(self.api_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['square_footage'], 500000)
        self.assertEqual(response.data['bedrooms'], 300)

    def test_list_endpoint_disabled(self):
        """Test that list endpoint returns 405 Method Not Allowed"""
        response = self.client.get(self.api_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_retrieve_endpoint_disabled(self):
        """Test that retrieve endpoint returns 405 Method Not Allowed"""
        url = reverse('prediction-detail', args=[self.prediction1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_session_predictions_with_valid_token(self):
        """Test fetching predictions for a specific session"""
        session_url = reverse('session-data')
        response = self.client.get(f'{session_url}?session_token={self.session_1}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.prediction1.id)

    def test_session_predictions_without_token(self):
        """Test fetching predictions without session_token"""
        session_url = reverse('session-data')
        response = self.client.get(session_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_session_predictions_different_sessions_isolated(self):
        """Test that different sessions only see their own predictions"""
        session_url = reverse('session-data')
        response = self.client.get(f'{session_url}?session_token={self.session_1}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['session_token'], self.session_1)

    def test_session_update_prediction(self):
        """Test updating a prediction in a session"""
        session_token = self.session_1
        update_url = reverse('session-update', args=[self.prediction1.id])
        response = self.client.patch(
            f'{update_url}?session_token={session_token}',
            {'name': 'Updated Name', 'bedrooms': 4},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.prediction1.refresh_from_db()
        self.assertEqual(self.prediction1.name, 'Updated Name')
        self.assertEqual(self.prediction1.bedrooms, 4)

    def test_session_update_prediction_square_footage_exceeds_max(self):
        """Test updating prediction with square footage exceeding limit"""
        session_token = self.session_1
        update_url = reverse('session-update', args=[self.prediction1.id])
        response = self.client.patch(
            f'{update_url}?session_token={session_token}',
            {'square_footage': 500001},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot exceed 500,000', response.data['error'])

    def test_session_update_prediction_bedrooms_exceeds_max(self):
        """Test updating prediction with bedrooms exceeding limit"""
        session_token = self.session_1
        update_url = reverse('session-update', args=[self.prediction1.id])
        response = self.client.patch(
            f'{update_url}?session_token={session_token}',
            {'bedrooms': 301},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot exceed 300', response.data['error'])

    def test_session_update_prediction_at_max_limits(self):
        """Test updating prediction to max limits (should succeed)"""
        session_token = self.session_1
        update_url = reverse('session-update', args=[self.prediction1.id])
        response = self.client.patch(
            f'{update_url}?session_token={session_token}',
            {'square_footage': 500000, 'bedrooms': 300},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.prediction1.refresh_from_db()
        self.assertEqual(self.prediction1.square_footage, 500000)
        self.assertEqual(self.prediction1.bedrooms, 300)

    def test_session_update_prediction_wrong_session(self):
        """Test updating fails when session doesn't match"""
        wrong_session = 'wrong-session'
        update_url = reverse('session-update', args=[self.prediction1.id])
        response = self.client.patch(
            f'{update_url}?session_token={wrong_session}',
            {'name': 'Hacked'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_session_delete_prediction(self):
        """Test deleting a prediction in a session"""
        session_token = self.session_1
        delete_url = reverse('session-delete', args=[self.prediction1.id])
        response = self.client.delete(
            f'{delete_url}?session_token={session_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            PricePrediction.objects.filter(id=self.prediction1.id).exists()
        )

    def test_session_delete_prediction_wrong_session(self):
        """Test deleting fails when session doesn't match"""
        wrong_session = 'wrong-session'
        delete_url = reverse('session-delete', args=[self.prediction1.id])
        response = self.client.delete(
            f'{delete_url}?session_token={wrong_session}'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(
            PricePrediction.objects.filter(id=self.prediction1.id).exists()
        )
