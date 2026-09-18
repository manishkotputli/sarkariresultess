#!/bin/bash

set -e

echo "========================================"
echo "🚀 Starting Sarkari Resultess deployment"
echo "========================================"

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "📁 App directory: $APP_DIR"

# --------------------------------------------------
# Environment
# --------------------------------------------------

export NODE_ENV=production
export ENV=production

echo "NODE_ENV=$NODE_ENV"
echo "ENV=$ENV"

# --------------------------------------------------
# Node / npm
# --------------------------------------------------

NODE_BIN="$(command -v node || true)"
NPM_BIN="$(command -v npm || true)"

if [ -z "$NODE_BIN" ]; then
    echo "❌ Node.js not found"
    exit 1
fi

if [ -z "$NPM_BIN" ]; then
    echo "❌ npm not found"
    exit 1
fi

echo "Node: $NODE_BIN"
echo "npm : $NPM_BIN"

node -v
npm -v

# --------------------------------------------------
# Dependencies
# --------------------------------------------------

echo "========================================"
echo "📦 Installing production dependencies"
echo "========================================"

if [ -f package-lock.json ]; then
    npm ci --omit=dev
else
    npm install --omit=dev
fi

# --------------------------------------------------
# Database migrations
# --------------------------------------------------

echo "========================================"
echo "🗄️ Running database migrations"
echo "========================================"

./node_modules/.bin/sequelize db:migrate --env production

echo "✅ Migrations completed"

# --------------------------------------------------
# Seeders
# --------------------------------------------------
# DO NOT run seeders automatically in production.
# Run manually only when required.
# --------------------------------------------------

echo "========================================"
echo "🌱 Production seeders skipped"
echo "========================================"

# --------------------------------------------------
# Restart application
# --------------------------------------------------

echo "========================================"
echo "♻️ Restarting Node application"
echo "========================================"

mkdir -p tmp
touch tmp/restart.txt

echo "========================================"
echo "✅ Deployment completed successfully"
echo "========================================"