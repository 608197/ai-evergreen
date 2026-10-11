# ==============================================================================
# AI Evergreen — React 19 Enterprise UI Dockerfile
# Multi-stage build: node:22-alpine -> nginx:alpine
# ==============================================================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled SPA bundle
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
