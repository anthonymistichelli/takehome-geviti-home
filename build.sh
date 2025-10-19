#!/bin/bash

# Build script for Home Price Predictor Docker images
# Builds both backend and frontend images using docker-compose

set -e

echo "════════════════════════════════════════════════════════════════"
echo "              Building Home Price Predictor Images"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Please install Docker from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if docker-compose is available
if ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not available."
    echo "Please install Docker Desktop which includes Docker Compose."
    exit 1
fi

echo "✓ Docker is installed"
echo "✓ Docker Compose is available"
echo ""

# Build images directly using docker build
echo "Building backend image..."
docker build -f backend/Dockerfile -t geviti-takehome-backend:latest .

echo ""
echo "Building frontend image..."
docker build -f frontend/Dockerfile -t geviti-takehome-frontend:latest .

echo ""
echo "Saving images to tar files..."
echo "  Saving backend image..."
docker save geviti-takehome-backend:latest | gzip > geviti-takehome-backend.tar.gz

echo "  Saving frontend image..."
docker save geviti-takehome-frontend:latest | gzip > geviti-takehome-frontend.tar.gz

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Build complete!"
echo ""
echo "Created tar files:"
echo "  - geviti-takehome-backend.tar.gz"
echo "  - geviti-takehome-frontend.tar.gz"
echo ""
echo "To run the application:"
echo "  ./run.sh"
echo ""
echo "To rebuild without cache:"
echo "  docker compose build --no-cache"
echo "  Then run ./build.sh again to recreate tar files"
echo ""
echo "To stop the application:"
echo "  docker compose down"
echo "════════════════════════════════════════════════════════════════"
