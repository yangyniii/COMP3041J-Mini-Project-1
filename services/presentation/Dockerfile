# Presentation Service Dockerfile
FROM node:18-alpine

# Install serve globally for production
RUN npm install -g serve

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . /app

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Serve the built application
CMD ["serve", "-s", "build", "-l", "3000"]
