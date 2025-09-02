# Multi-stage build for smaller final image
# Use Node.js 20 LTS Alpine for security and performance
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies with npm ci for faster, reproducible builds
# Configure npm to handle potential SSL issues in CI environments
RUN npm config set strict-ssl false && \
    npm ci --silent && \
    npm config delete strict-ssl

# Copy source code and configuration files
COPY . ./

# Build the application using Vite
RUN ./scripts/build.sh

# Production stage - smaller final image with only runtime dependencies
FROM node:20-alpine AS production

WORKDIR /app

# Install serve for production serving
# Configure npm to handle potential SSL issues in CI environments
RUN npm config set strict-ssl false && \
    npm install -g serve && \
    npm config delete strict-ssl

# Set environment variable using modern format
ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT:-PRODUCTION}

# Copy built application from builder stage (excludes node_modules and source)
COPY --from=builder /app/build ./build
COPY --from=builder /app/variables.sh ./variables.sh

# Set proper permissions
RUN chmod +x ./variables.sh

# Use exec form for better signal handling and process management
CMD ["sh", "-c", "./variables.sh build && serve -s -l tcp://0.0.0.0:3000 build/"]
