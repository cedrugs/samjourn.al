FROM oven/bun:1 AS base

FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock* ./
RUN bun install --frozen-lockfile
COPY frontend .
RUN NODE_ENV=production bun run build

FROM base AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/bun.lock* ./
RUN bun install --frozen-lockfile
COPY backend .

FROM oven/bun:1-alpine
RUN apk add --no-cache caddy

WORKDIR /app
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
COPY --from=backend-build /app/backend /app/backend
COPY Caddyfile /etc/caddy/Caddyfile
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 80

CMD ["/app/start.sh"]
