#!/bin/bash

# Firebase Extension - BigQuery to Firestore Sync
# Development Environment Setup Script

set -e

echo "🚀 Setting up development environment..."
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js 18 or higher is required"
  echo "   Current version: $(node -v)"
  exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd functions
npm install
echo "✅ Dependencies installed"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build
echo "✅ Build successful"
echo ""

# Run linter
echo "🔍 Running linter..."
npm run lint
echo "✅ Linting passed"
echo ""

# Run formatter check
echo "💅 Checking code formatting..."
npm run format
echo "✅ Formatting check passed"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
echo "✅ All tests passed"
echo ""

echo "✨ Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run build        - Build TypeScript"
echo "  npm run lint         - Check for linting errors"
echo "  npm run lint:fix     - Auto-fix linting errors"
echo "  npm run format       - Check formatting"
echo "  npm run format:fix   - Auto-fix formatting"
echo "  npm run fix          - Auto-fix both lint and format"
echo "  npm test             - Run tests"
echo "  npm run test:watch   - Run tests in watch mode"
echo "  npm run precommit    - Run all checks before commit"
echo ""
