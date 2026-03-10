#!/bin/sh

# Build script for 1MCP Agent
# This script handles the build command logic in local and git-dependency installs.

set -e

echo "🔨 Building 1MCP Agent..."

if [ ! -x "./node_modules/.bin/tsc" ]; then
  echo "❌ Missing TypeScript compiler (./node_modules/.bin/tsc)." >&2
  echo "Install dependencies first (npm ci / npm install)." >&2
  exit 1
fi

if [ ! -x "./node_modules/.bin/tsc-alias" ]; then
  echo "❌ Missing tsc-alias binary (./node_modules/.bin/tsc-alias)." >&2
  echo "Install dependencies first (npm ci / npm install)." >&2
  exit 1
fi

# Compile TypeScript
echo "📦 Compiling TypeScript..."
./node_modules/.bin/tsc --project tsconfig.build.json

# Resolve path aliases
echo "🔗 Resolving path aliases..."
./node_modules/.bin/tsc-alias -p tsconfig.build.json

# Make the built file executable
echo "🔧 Making build/index.js executable..."
node -e "require('fs').chmodSync('build/index.js', '755')"

echo "✅ Build completed successfully!"
