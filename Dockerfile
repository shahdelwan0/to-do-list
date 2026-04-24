# build stage -> using nodejs -> compilation
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json package-lock.json* ./

RUN npm ci || npm install

COPY . .

RUN npm run build
#  prod stage -> using nginx -> serving static files

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo "server { listen 8081; location /health { return 200 'healthy\n'; } }" > /etc/nginx/conf.d/health.conf


EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]