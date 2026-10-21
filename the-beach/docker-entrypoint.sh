#!/bin/sh
# docker-entrypoint.sh — runs at container startup in the-beach
# Substitutes env-var placeholders in index.html meta tags BEFORE the server starts

set -e

INDEX="/app/the-beach/public/index.html"

if [ -f "$INDEX" ]; then
  # Replace meta tag content with actual env-var values if set
  # Handles the shell-substitution format: ${VAR:-default}
  if [ -n "$Y8_APP_URL" ]; then
    sed -i "s|content=\"\${Y8_APP_URL:-[^\"]*}\"|content=\"$Y8_APP_URL\"|g" "$INDEX"
  fi
  if [ -n "$Y8_SERVER_URL" ]; then
    sed -i "s|content=\"\${Y8_SERVER_URL:-[^\"]*}\"|content=\"$Y8_SERVER_URL\"|g" "$INDEX"
  fi
  echo "✅ index.html meta tags updated with production URLs"
fi

# Hand off to the NestJS server
exec node dist/main
