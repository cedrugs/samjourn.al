#!/bin/sh
set -e

cd /app/backend

# Run migrations
bun run drizzle-kit push

# Seed admin user if ADMIN_EMAIL is set
if [ -n "$ADMIN_EMAIL" ]; then
  bun run src/seed.ts
fi

# Start backend in production mode
NODE_ENV=production bun run src/index.ts &

# Start Caddy
caddy run --config /etc/caddy/Caddyfile
