#!/bin/sh

#
# Run a command in a docker node container.
#
# Usage: [NODE_ENV=production] ./docker-node.sh command [args ...]
#

set -e

cd "$(dirname "$0")/../"

CMD="$1"
shift

# Create the host volumes so the docker process does not create it as root:
mkdir -p \
  "$PWD/node_modules" \
  "$PWD/build/node_modules" \
  "$PWD/../.yarncache"

set -- \
  -v "$PWD:/srv/www" \
  -v "$PWD/build/node_modules:/srv/www/node_modules" \
  -v "$PWD/../.yarncache:/srv/www/.yarncache" \
  -e "YARN_CACHE_FOLDER=/srv/www/.yarncache" \
  -e CI \
  -e BUILDKITE \
  -e BUILDKITE_BRANCH \
  -e BUILDKITE_BUILD_CHECKOUT_PATH \
  -e BUILDKITE_BUILD_NUMBER \
  -e BUILDKITE_BUILD_URL \
  -e BUILDKITE_COMMIT \
  -e BUILDKITE_ORGANIZATION_SLUG \
  -e BUILDKITE_PROJECT_SLUG \
  -e BUILDKITE_PULL_REQUEST \
  -e BUILDKITE_PULL_REQUEST_BASE_BRANCH \
  -e BUILDKITE_TAG \
  -e NODE_ENV \
  -e NPM_TOKEN \
  -e GITHUB_TOKEN \
  --entrypoint "$CMD" \
  --rm \
  allthings/node \
  "$@"

# Must run as root on Buildkite to avoid permission issues.
# The root user is remapped to the buildkite-agent via userns-remap:
# https://docs.docker.com/engine/security/userns-remap/
if [ "$BUILDKITE" = true ]; then
  set -- --user root "$@"
fi

docker run "$@"
