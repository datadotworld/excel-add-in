#!/usr/bin/env bash
set -o errexit  -o pipefail -o nounset

PUBLIC_REPO_COMMIT=$(cd excel-add-in; git rev-parse HEAD | head -c8)
TIMESTAMPED_VERSION="$(date -u '+%Y%m%d%H%M%S')"
echo "${TIMESTAMPED_VERSION}_${PUBLIC_REPO_COMMIT}"