#!/bin/sh

# Build script for 1MCP Agent
# This script handles the complex build command logic

set -e

echo "🔨 Building 1MCP Agent..."

run_exec() {
  if command -v npm >/dev/null 2>&1; then
    npm exec -- "$@"
  elif command -v pnpm >/dev/null 2>&1; then
    pnpm exec "$@"
  else
    echo "Neither npm nor pnpm is available" >&2
    exit 1
  fi
}

# Compile TypeScript
echo "📦 Compiling TypeScript..."
run_exec tsc --project tsconfig.build.json

# Resolve path aliases
echo "🔗 Resolving path aliases..."
run_exec tsc-alias -p tsconfig.build.json

# Make the built file executable
echo "🔧 Making build/index.js executable..."
node -e "require('fs').chmodSync('build/index.js', '755')"

echo "✅ Build completed successfully!"
