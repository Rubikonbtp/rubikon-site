FROM node:20-alpine AS api

WORKDIR /app
COPY api/package.json api/package-lock.json* ./
RUN npm install --production 2>/dev/null || true
COPY api/ ./

FROM nginx:alpine

# Copy static site
COPY index.html /usr/share/nginx/html/
COPY products.html /usr/share/nginx/html/
COPY industries.html /usr/share/nginx/html/
COPY about.html /usr/share/nginx/html/
COPY chat-widget.js /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/
COPY img/ /usr/share/nginx/html/img/
COPY docs/ /usr/share/nginx/html/docs/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy API files
COPY --from=api /app /app

# Install Node.js in nginx container for API
RUN apk add --no-cache nodejs npm

EXPOSE 8080

# Start both nginx and node API
CMD sh -c "node /app/server.js & nginx -g 'daemon off;'"
