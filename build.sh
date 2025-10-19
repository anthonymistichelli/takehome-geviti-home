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

# Build for development
echo "Building images for development..."
docker compose build

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Build complete!"
echo ""
echo "To run the application:"
echo "  docker compose up"
echo ""
echo "To rebuild without cache:"
echo "  docker compose build --no-cache"
echo ""
echo "To remove all images and containers:"
echo "  docker compose down -v"
echo "════════════════════════════════════════════════════════════════"
