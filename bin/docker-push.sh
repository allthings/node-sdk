#!/bin/sh

set -e

IMAGE=${1:?}

if [ "$BUILDKITE_BRANCH" = master ]; then
  TAG=latest
else
  # Adhere to the docker tag naming rules:
  # https://docs.docker.com/engine/reference/commandline/tag/
  TAG=$(echo "$BUILDKITE_BRANCH" | sed 's/[^a-zA-Z0-9._-]/_/g')
fi

echo "--- Building $IMAGE:$TAG"
docker build -t "$IMAGE:$TAG" .

echo "--- Pushing $IMAGE:$TAG"
docker push "$IMAGE:$TAG"
