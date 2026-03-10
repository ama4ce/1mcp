#!/bin/sh

# Build script for 1MCP Agent
# This script handles the build command logic in local and git-dependency installs.

set -e

echo "🔨 Building 1MCP Agent..."

ensure_build_tools() {
  if [ -x "./node_modules/.bin/tsc" ] && [ -x "./node_modules/.bin/tsc-alias" ]; then
    return 0
  fi

  echo "⚙️  Build tools are missing, installing local dev dependencies..."
  npm install --include=dev --ignore-scripts --no-audit --no-fund --silent

  if [ ! -x "./node_modules/.bin/tsc" ] || [ ! -x "./node_modules/.bin/tsc-alias" ]; then
    echo "❌ Missing build tools after dependency install (tsc / tsc-alias)." >&2
    exit 1
  fi
}

ensure_build_tools

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
