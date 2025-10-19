#!/bin/bash

# Home Price Predictor - Run Script
# This script checks dependencies, loads Docker images, and runs the application
# For customers who received pre-built Docker images

set -e

echo "════════════════════════════════════════════════════════════════"
echo "         Home Price Predictor - Startup Script"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════
# STEP 1: CHECK DEPENDENCIES
# ═══════════════════════════════════════════════════════════════════

echo -e "${BLUE}Step 1: Checking Docker Dependencies...${NC}"
echo ""

MISSING_DEPS=()
INSTALLED_DEPS=()

# Check Docker
echo -n "  Checking Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    echo -e "${GREEN}✓${NC} Found (v$DOCKER_VERSION)"
    INSTALLED_DEPS+=("Docker (v$DOCKER_VERSION)")
else
    echo -e "${RED}✗${NC} Not found"
    MISSING_DEPS+=("Docker")
fi

# Check Docker Compose
echo -n "  Checking Docker Compose... "
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version | awk '{print $NF}')
    echo -e "${GREEN}✓${NC} Found (v$COMPOSE_VERSION)"
    INSTALLED_DEPS+=("Docker Compose (v$COMPOSE_VERSION)")
else
    echo -e "${RED}✗${NC} Not found"
    MISSING_DEPS+=("Docker Compose")
fi

# Check Docker daemon
echo -n "  Checking Docker daemon... "
if docker ps &> /dev/null; then
    echo -e "${GREEN}✓${NC} Running"
    INSTALLED_DEPS+=("Docker daemon (running)")
else
    echo -e "${RED}✗${NC} Not running or no permission"
    MISSING_DEPS+=("Docker daemon access")
fi

echo ""

# Handle missing dependencies
if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo -e "${RED}✗ Missing dependencies detected!${NC}"
    echo ""
    echo "Missing:"
    for dep in "${MISSING_DEPS[@]}"; do
        echo "  ✗ $dep"
    done
    echo ""
    
    echo -e "${YELLOW}Installation instructions:${NC}"
    echo ""
    
    # Check OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "On macOS (with Homebrew):"
        echo "  brew install docker"
        echo ""
        echo "Or download Docker Desktop:"
        echo "  https://www.docker.com/products/docker-desktop"
        echo ""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "On Linux (Ubuntu/Debian):"
        echo "  sudo apt-get update"
        echo "  sudo apt-get install docker.io docker-compose"
        echo "  sudo usermod -aG docker \$USER"
        echo "  newgrp docker"
        echo ""
    else
        echo "On Windows:"
        echo "  Download Docker Desktop:"
        echo "  https://www.docker.com/products/docker-desktop"
        echo ""
    fi
    
    echo "After installation, run this script again."
    exit 1
fi

echo -e "${GREEN}✓ All dependencies installed!${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 2: CHECK FOR DOCKER IMAGES
# ═══════════════════════════════════════════════════════════════════

echo -e "${BLUE}Step 2: Checking for Docker Images...${NC}"
echo ""

BACKEND_IMAGE_FILE="geviti-takehome-backend.tar.gz"
FRONTEND_IMAGE_FILE="geviti-takehome-frontend.tar.gz"

BACKEND_IMAGE_EXISTS=$(docker images | grep -c "geviti-takehome-backend" || true)
FRONTEND_IMAGE_EXISTS=$(docker images | grep -c "geviti-takehome-frontend" || true)

# Check if we need to load images from files
if [ $BACKEND_IMAGE_EXISTS -eq 0 ] && [ -f "$BACKEND_IMAGE_FILE" ]; then
    echo -n "  Loading backend image from $BACKEND_IMAGE_FILE... "
    docker load -i "$BACKEND_IMAGE_FILE" > /dev/null 2>&1
    echo -e "${GREEN}✓ Loaded${NC}"
elif [ $BACKEND_IMAGE_EXISTS -gt 0 ]; then
    echo -e "  Backend image: ${GREEN}✓ Already loaded${NC}"
else
    echo -e "  Backend image: ${RED}✗ Not found${NC}"
    echo "    Looked for: $BACKEND_IMAGE_FILE"
    exit 1
fi

if [ $FRONTEND_IMAGE_EXISTS -eq 0 ] && [ -f "$FRONTEND_IMAGE_FILE" ]; then
    echo -n "  Loading frontend image from $FRONTEND_IMAGE_FILE... "
    docker load -i "$FRONTEND_IMAGE_FILE" > /dev/null 2>&1
    echo -e "${GREEN}✓ Loaded${NC}"
elif [ $FRONTEND_IMAGE_EXISTS -gt 0 ]; then
    echo -e "  Frontend image: ${GREEN}✓ Already loaded${NC}"
else
    echo -e "  Frontend image: ${RED}✗ Not found${NC}"
    echo "    Looked for: $FRONTEND_IMAGE_FILE"
    exit 1
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 3: START CONTAINERS
# ═══════════════════════════════════════════════════════════════════

echo -e "${BLUE}Step 3: Starting Application...${NC}"
echo ""

# Check if containers are already running
if docker compose ps 2>/dev/null | grep -q "running"; then
    echo -e "${YELLOW}Containers are already running!${NC}"
    echo ""
    echo "The application is available at:"
    echo -e "  ${GREEN}Frontend: http://localhost:5173${NC}"
    echo -e "  ${GREEN}Backend:  http://localhost:8000${NC}"
    echo ""
    echo "To stop: Ctrl+C or run 'docker compose down'"
    echo ""
else
    echo "  Starting containers..."
    docker compose up
fi
