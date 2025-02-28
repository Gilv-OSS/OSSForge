# Base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Nelua dependencies
RUN apt-get update && apt-get install -y \
    lua5.3 \
    liblua5.3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]