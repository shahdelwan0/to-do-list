# Build static frontend assets.
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# Runtime image serves dist/ via Express and exposes /metrics for Prometheus.
FROM node:18-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js ./server.js

EXPOSE 8082
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:8082/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]