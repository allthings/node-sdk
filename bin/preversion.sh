#!/bin/sh

set -e

echo '--- Updating package.json'

# Omit prerelease-step on buildkite as we use semantic-release which invented an own prerelease-hook.
# prerelease in package.json was invented to prevent running manual release.
if [ "$BUILDKITE" = true ]; then
  sed -i '' -e '/preversion/d' package.json
fi

echo # Newline for better readability
