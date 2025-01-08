#!/usr/bin/env bash

set -o xtrace -o errexit -o pipefail -o nounset

PREFIX=$1
VERSION=$2
TAG="${PREFIX}-${VERSION}"

git config --get user.email || git config user.email "admin@data.world"
git config --get user.name || git config user.name "Sparkle"
git tag "${TAG}" -a -m "${TAG}"
git push origin "${TAG}"
