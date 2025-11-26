# -------- Stage 1: Build React App --------
FROM node:18-alpine AS build

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies with specific flags for React 19 compatibility
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --force --production=false

# Verify react-scripts is installed
RUN npm list react-scripts

# Copy the rest of the app
COPY . .

# Inject build-time env
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_STRIPE_PUBLISHABLE_KEY
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_STRIPE_PUBLISHABLE_KEY=${REACT_APP_STRIPE_PUBLISHABLE_KEY}

# Set environment variables to resolve build issues
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false
ENV CI=false
ENV NODE_ENV=production
ENV SKIP_PREFLIGHT_CHECK=true
ENV FAST_REFRESH=false

# Try to build using the Docker-specific build script
RUN npm run build:docker

# -------- Stage 2: Serve with NGINX --------
FROM nginx:alpine

# Remove default NGINX static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy React build from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Optional: Use custom NGINX config
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
