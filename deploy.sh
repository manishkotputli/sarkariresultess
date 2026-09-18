#!/bin/bash

set -e

echo "========================================"
echo "🚀 Sarkari Resultess Deployment"
echo "========================================"

# --------------------------------------------------
# Environment
# --------------------------------------------------

ENV="${ENV:-local}"

echo "Environment: $ENV"

# --------------------------------------------------
# Determine branch
# --------------------------------------------------

if [ "$ENV" = "production" ]; then

    BRANCH="production"
    DOMAIN="sarkariresultess.com"

    echo "🎯 Deployment Type: PRODUCTION"
    echo "🌐 Domain: $DOMAIN"
    echo "🌿 Branch: $BRANCH"

elif [ "$ENV" = "local" ]; then

    BRANCH="development"
    DOMAIN="uat.sarkariresultess.com"

    echo "🎯 Deployment Type: DEVELOPMENT / UAT"
    echo "🌐 Domain: $DOMAIN"
    echo "🌿 Branch: $BRANCH"

else

    echo "❌ Invalid ENV: $ENV"
    echo ""
    echo "Allowed values:"
    echo "  local"
    echo "  production"
    exit 1

fi

# --------------------------------------------------
# Project directory
# --------------------------------------------------

APP_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$APP_DIR"

echo ""
echo "📁 App directory:"
echo "$APP_DIR"

# --------------------------------------------------
# Node environment
# --------------------------------------------------

export NODE_ENV=production

if [ "$ENV" = "local" ]; then
    export APP_ENV=development
else
    export APP_ENV=production
fi

echo ""
echo "========================================"
echo "🔧 Environment"
echo "========================================"

echo "ENV: $ENV"
echo "NODE_ENV: $NODE_ENV"
echo "APP_ENV: $APP_ENV"

# --------------------------------------------------
# Verify Git repository
# --------------------------------------------------

echo ""
echo "========================================"
echo "🔍 Checking Git repository"
echo "========================================"

if [ ! -d ".git" ]; then
    echo "❌ Git repository not found"
    exit 1
fi

echo "✅ Git repository found"

# --------------------------------------------------
# Update source code
# --------------------------------------------------

echo ""
echo "========================================"
echo "📥 Updating source code"
echo "========================================"

echo "Fetching branch: $BRANCH"

git fetch origin "$BRANCH"

echo "Switching to branch: $BRANCH"

git checkout -B "$BRANCH" "origin/$BRANCH"

echo "Resetting to latest origin/$BRANCH"

git reset --hard "origin/$BRANCH"

echo ""
echo "✅ Source code updated"

echo "Current commit:"
git log -1 --oneline

# --------------------------------------------------
# Node / npm
# --------------------------------------------------

echo ""
echo "========================================"
echo "🔧 Node Environment"
echo "========================================"

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
# Install dependencies
# --------------------------------------------------

echo ""
echo "========================================"
echo "📦 Installing dependencies"
echo "========================================"

if [ ! -f package.json ]; then
    echo "❌ package.json not found"
    exit 1
fi

if [ "$ENV" = "production" ]; then

    echo "Installing production dependencies..."

    if [ -f package-lock.json ]; then
        npm ci --omit=dev
    else
        npm install --omit=dev
    fi

else

    echo "Installing development dependencies..."

    if [ -f package-lock.json ]; then
        npm ci
    else
        npm install
    fi

fi

echo "✅ Dependencies installed"

# --------------------------------------------------
# Database migrations
# --------------------------------------------------

echo ""
echo "========================================"
echo "🗄️ Running database migrations"
echo "========================================"

if [ "$ENV" = "production" ]; then

    echo "Running PRODUCTION migrations"

    ./node_modules/.bin/sequelize db:migrate --env production

else

    echo "Running DEVELOPMENT migrations"

    ./node_modules/.bin/sequelize db:migrate --env development

fi

echo "✅ Database migrations completed"

# --------------------------------------------------
# Seeders
# --------------------------------------------------

echo ""
echo "========================================"
echo "🌱 Database Seeders"
echo "========================================"

echo "⚠️ Automatic seeders are disabled."

# --------------------------------------------------
# Restart Node / Passenger
# --------------------------------------------------

echo ""
echo "========================================"
echo "♻️ Restarting Node application"
echo "========================================"

mkdir -p tmp

touch tmp/restart.txt

echo "✅ Restart signal sent"

# --------------------------------------------------
# Final status
# --------------------------------------------------

echo ""
echo "========================================"
echo "🎉 DEPLOYMENT SUCCESSFUL"
echo "========================================"

echo "Environment : $ENV"
echo "Branch      : $BRANCH"
echo "Domain      : $DOMAIN"
echo "Commit      : $(git log -1 --oneline)"

echo "========================================"