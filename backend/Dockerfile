# MediFlow Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mediflow -u 1001

# Change ownership of the app directory
RUN chown -R mediflow:nodejs /app
USER mediflow

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node src/healthcheck.js

# Start the application
CMD ["npm", "start"]
