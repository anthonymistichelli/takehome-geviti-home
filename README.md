# Home Price Predictor

A full-stack web application for predicting home prices based on square footage and bedrooms.

**Tech Stack**: Django REST API, React, TypeScript, Docker

## Getting Started

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker
- Docker Compose

#### If using pre-built tar file (from email delivery):

```bash
./run.sh
```

#### If cloning project from GitHub:

```bash
./build.sh
./run.sh
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

To stop: `docker compose down`

### Environment Configuration

For **development** (default), the app uses development settings from `backend/.env`:
- DEBUG mode is enabled
- ALLOWED_HOSTS accepts localhost and 127.0.0.1

For **production**, you must configure `backend/.env`:

1. Copy the example configuration:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` and update:
   - `DEBUG=False` (disable debug mode)
   - `SECRET_KEY=` (generate a strong random secret key)
   - `ALLOWED_HOSTS=` (your production domain)
   - `CORS_ALLOWED_ORIGINS=` (your frontend domain)

### Option 2: Local Development

**Prerequisites:**
- Python 3.8+
- Node.js 16+
- npm

```bash
./run-local-dev.sh
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Testing

```bash
./run-tests.sh
```

Includes:
- 33 backend tests (Django/pytest)
- 13 frontend tests (Vitest)

For verbose output: `./run-tests.sh -v`

## Using the Application

### Make a Prediction

1. Navigate to http://localhost:5173
2. Enter square footage and number of bedrooms
3. Click "Predict Price"

### Admin Dashboard

1. Click the "History" button
3. View, create, update, or delete predictions, specific to browser session.

## API Reference

### Create Prediction

```bash
curl -X POST http://localhost:8000/api/predictions/ \
  -H "Content-Type: application/json" \
  -d '{
    "session_token": "your_session_token",
    "square_footage": 2000,
    "bedrooms": 3,
    "name": "My Home"
  }'
```

Response:

```json
{
  "id": 1,
  "session_token": "your_session_token",
  "square_footage": 2000,
  "bedrooms": 3,
  "predicted_price": 450000,
  "created_at": "2024-10-18T16:20:00Z",
  "name": "My Home"
}
```

The predicted price is calculated using a Linear Regression model trained on historical housing data.

## Project Structure

```
backend/
  config/           - Django configuration
  predictions/      - Models, views, serializers, ML model
  manage.py
  Dockerfile

frontend/
  src/              - React components and styles
  Dockerfile

docker-compose.yml - Service orchestration
run.sh            - Start services (Docker)
run-local-dev.sh  - Start services (Local)
build.sh          - Build Docker images
run-tests.sh      - Run test suite
```

## Troubleshooting

**Port already in use:**

Edit `docker-compose.yml` to change port mappings, then restart:

```bash
docker compose down
docker compose up -d
```

**Need to rebuild Docker images:**

```bash
./build.sh
docker compose up -d
```

## Features

- Price estimation based on square footage and bedrooms
- Admin dashboard for managing predictions
- Full CRUD API operations
- Email-based admin authentication
- WCAG 2.1 Level AA compliant
- Comprehensive test coverage (46 tests)
- Runs entirely in Docker or locally

## Notes

- Predictions are stored in SQLite database
- Admin authentication uses email domain validation
- ML model uses Linear Regression on historical housing data
- TypeScript: Strict mode enabled
- WCAG 2.1 Level AA accessibility
