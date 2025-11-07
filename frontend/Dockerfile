# frontend/Dockerfile
# 1) Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Run (nginx)
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Optional: set base path, caching, etc.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]