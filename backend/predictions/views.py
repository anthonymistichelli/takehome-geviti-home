"""
REST API views for predictions app.

This module contains REST API endpoints for managing home price predictions
with session-based access control.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PricePrediction
from .serializers import PricePredictionSerializer
from .predictor import predict_home_price


class PricePredictionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for home price predictions.
    
    create: Create a new prediction (POST with square_footage, bedrooms, and session_token)
    """
    queryset = PricePrediction.objects.all()
    serializer_class = PricePredictionSerializer

    def list(self, request, *args, **kwargs):
        """List endpoint is disabled."""
        return Response(
            {'error': 'Not available'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def retrieve(self, request, *args, **kwargs):
        """Retrieve endpoint is disabled."""
        return Response(
            {'error': 'Not available'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def create(self, request, *args, **kwargs):
        """
        Create a new prediction.
        Expected POST data: { "session_token": str, "square_footage": float, "bedrooms": int, "name": str (optional) }
        """
        square_footage = request.data.get('square_footage')
        bedrooms = request.data.get('bedrooms')
        session_token = request.data.get('session_token', '')
        name = request.data.get('name', '')

        # Validate inputs
        if square_footage is None or bedrooms is None:
            return Response(
                {'error': 'square_footage and bedrooms are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not session_token:
            return Response(
                {'error': 'session_token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            square_footage = float(square_footage)
            bedrooms = int(bedrooms)
        except (ValueError, TypeError):
            return Response(
                {'error': 'square_footage must be a number and bedrooms must be an integer'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate positive numbers
        if square_footage <= 0:
            return Response(
                {'error': 'square_footage must be greater than 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if bedrooms <= 0:
            return Response(
                {'error': 'bedrooms must be greater than 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate maximum limits
        if square_footage > 500000:
            return Response(
                {'error': 'square_footage cannot exceed 500,000'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if bedrooms > 300:
            return Response(
                {'error': 'bedrooms cannot exceed 300'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get prediction from model
        predicted_price = predict_home_price(square_footage, bedrooms)

        # Save to database
        prediction = PricePrediction.objects.create(
            session_token=session_token,
            name=name,
            square_footage=square_footage,
            bedrooms=bedrooms,
            predicted_price=predicted_price
        )

        serializer = self.get_serializer(prediction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def session_predictions(request):
    """
    Get predictions for the current session.
    Filters predictions by session_token.
    Expected: /api/predictions/session-data/?session_token=<user_session_token>
    """
    session_token = request.query_params.get('session_token', '')

    if not session_token:
        return Response(
            {'error': 'session_token query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    predictions = PricePrediction.objects.filter(session_token=session_token)
    serializer = PricePredictionSerializer(predictions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH', 'PUT'])
def session_update_prediction(request, pk):
    """
    Update a prediction for the current session.
    Requires session_token query parameter matching the prediction's session token.
    Expected PATCH/PUT data: { "name": str, "square_footage": float, "bedrooms": int }
    """
    session_token = request.query_params.get('session_token', '')

    if not session_token:
        return Response(
            {'error': 'session_token query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        prediction = PricePrediction.objects.get(pk=pk, session_token=session_token)
    except PricePrediction.DoesNotExist:
        return Response(
            {'error': 'Prediction not found or does not belong to this session'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Update name if provided
    if 'name' in request.data:
        prediction.name = request.data.get('name', '')

    # Update square_footage if provided
    square_footage = request.data.get('square_footage')
    if square_footage is not None:
        try:
            square_footage = float(square_footage)
            if square_footage <= 0:
                return Response(
                    {'error': 'square_footage must be greater than 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if square_footage > 500000:
                return Response(
                    {'error': 'square_footage cannot exceed 500,000'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            prediction.square_footage = square_footage
        except (ValueError, TypeError):
            return Response(
                {'error': 'square_footage must be a valid number'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Update bedrooms if provided
    bedrooms = request.data.get('bedrooms')
    if bedrooms is not None:
        try:
            bedrooms = int(bedrooms)
            if bedrooms <= 0:
                return Response(
                    {'error': 'bedrooms must be greater than 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if bedrooms > 300:
                return Response(
                    {'error': 'bedrooms cannot exceed 300'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            prediction.bedrooms = bedrooms
        except (ValueError, TypeError):
            return Response(
                {'error': 'bedrooms must be a valid integer'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Recalculate price if either field was updated
    if square_footage is not None or bedrooms is not None:
        prediction.predicted_price = predict_home_price(
            prediction.square_footage,
            prediction.bedrooms
        )

    prediction.save()
    serializer = PricePredictionSerializer(prediction)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def session_delete_prediction(request, pk):
    """
    Delete a prediction for the current session.
    Requires session_token query parameter matching the prediction's session token.
    """
    session_token = request.query_params.get('session_token', '')

    if not session_token:
        return Response(
            {'error': 'session_token query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        prediction = PricePrediction.objects.get(pk=pk, session_token=session_token)
        prediction.delete()
        return Response(
            {'message': 'Prediction deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
    except PricePrediction.DoesNotExist:
        return Response(
            {'error': 'Prediction not found or does not belong to this session'},
            status=status.HTTP_404_NOT_FOUND
        )
