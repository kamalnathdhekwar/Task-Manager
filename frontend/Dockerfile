# Use official Node.js image as the base
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app for production
RUN npm run build

# Expose port (Vite preview default is 4173)
EXPOSE 4173

# Start the production preview server
CMD ["npm", "run", "dev"]