# Production lightweight Nginx container
FROM nginx:alpine

LABEL maintainer="SIL Lubricants Maroc <contact@sil-lubricants.ma>"
LABEL description="Official SIL Lubricants Morocco Multilingual Website & Catalog"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all website assets and data
COPY . /usr/share/nginx/html/

# Clean unwanted files inside html root
RUN rm -f /usr/share/nginx/html/Dockerfile \
    && rm -f /usr/share/nginx/html/docker-compose.yml \
    && rm -f /usr/share/nginx/html/nginx.conf \
    && rm -f /usr/share/nginx/html/.dockerignore

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
