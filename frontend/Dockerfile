# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
# First try npm ci, if it fails (no lock file or corrupted), fall back to npm install
# Then clean and reinstall to ensure proper symlinks are created
RUN npm install 2>&1 && npm rebuild

# Copy frontend code
COPY frontend/ .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to serve the built app
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5173

# Start the app
CMD ["serve", "-s", "dist", "-l", "5173"]
