#!/bin/bash

# Local Development Runner
# Runs Django backend and React frontend without Docker

echo "=========================================="
echo "Home Price Predictor - Local Dev"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3.13 &> /dev/null; then
    echo "❌ Python 3.13 is not installed"
    echo "Please install Python 3.13 or update the script to use an available Python version"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✓ Python found: $(python3.13 --version)"
echo "✓ Node.js found: $(node --version)"
echo ""

# Start Backend
echo "Starting Django backend..."
cd backend

# Delete old venv if it exists (to ensure fresh setup)
if [ -d "venv" ]; then
    rm -rf venv
fi

# Create virtual environment
python3.13 -m venv venv

# Get the absolute path to the venv
VENV_PYTHON="$(pwd)/venv/bin/python"
VENV_PIP="$(pwd)/venv/bin/pip"

# Install dependencies using full paths
echo "Installing Python dependencies..."
$VENV_PIP install --upgrade pip setuptools wheel > /dev/null 2>&1
$VENV_PIP install -r requirements.txt

# Run migrations using full paths
echo "Running migrations..."
$VENV_PYTHON manage.py migrate --noinput

# Start Django development server using full paths
echo "Django running at http://localhost:8000"
$VENV_PYTHON manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

cd ..

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo ""
echo "Starting React frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install --silent
fi

# Start React development server
echo "React running at http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "=========================================="
echo "✓ Local development environment ready!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Handle cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM EXIT

# Wait for both processes
wait
