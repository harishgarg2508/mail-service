FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package and package-lock files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application files (excluding those in .dockerignore)
COPY . .

# Expose the service port
EXPOSE 7860

# Set environment defaults
ENV PORT=7860
ENV NODE_ENV=production

# Start application
CMD ["node", "index.js"]
