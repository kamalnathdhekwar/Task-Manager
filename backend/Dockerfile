FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci --only=production

# Copy rest of the app
COPY . .

# Expose backend port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
