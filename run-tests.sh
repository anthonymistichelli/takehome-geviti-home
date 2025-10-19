#!/bin/bash

# Test runner script for both frontend and backend

echo "=========================================="
echo "Home Price Predictor - Test Runner"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
RUN_BACKEND=true
RUN_FRONTEND=true
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --backend-only)
      RUN_FRONTEND=false
      shift
      ;;
    --frontend-only)
      RUN_BACKEND=false
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: ./run-tests.sh [--backend-only] [--frontend-only] [--verbose]"
      exit 1
      ;;
  esac
done

BACKEND_PASSED=true
FRONTEND_PASSED=true

# Run backend tests
if [ "$RUN_BACKEND" = true ]; then
  echo -e "${YELLOW}Running Backend Tests...${NC}"
  echo ""
  
  cd backend
  
  # Use venv/bin/python if it exists, otherwise fall back to python
  PYTHON_CMD="python"
  if [ -f venv/bin/python ]; then
    PYTHON_CMD="venv/bin/python"
  fi
  
  if [ "$VERBOSE" = true ]; then
    $PYTHON_CMD manage.py test predictions -v 2
  else
    $PYTHON_CMD manage.py test predictions
  fi
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend tests passed${NC}"
  else
    echo -e "${RED}✗ Backend tests failed${NC}"
    BACKEND_PASSED=false
  fi
  
  cd ..
  echo ""
fi

# Run frontend tests
if [ "$RUN_FRONTEND" = true ]; then
  echo -e "${YELLOW}Running Frontend Tests...${NC}"
  echo ""
  
  cd frontend
  
  if [ "$VERBOSE" = true ]; then
    npm test -- --reporter=verbose --run
  else
    npm test -- --run
  fi
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend tests passed${NC}"
  else
    echo -e "${RED}✗ Frontend tests failed${NC}"
    FRONTEND_PASSED=false
  fi
  
  cd ..
  echo ""
fi

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="

if [ "$RUN_BACKEND" = true ]; then
  if [ "$BACKEND_PASSED" = true ]; then
    echo -e "${GREEN}Backend:  PASSED${NC}"
  else
    echo -e "${RED}Backend:  FAILED${NC}"
  fi
fi

if [ "$RUN_FRONTEND" = true ]; then
  if [ "$FRONTEND_PASSED" = true ]; then
    echo -e "${GREEN}Frontend: PASSED${NC}"
  else
    echo -e "${RED}Frontend: FAILED${NC}"
  fi
fi

echo "=========================================="

if [ "$BACKEND_PASSED" = true ] && [ "$FRONTEND_PASSED" = true ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed${NC}"
  exit 1
fi
