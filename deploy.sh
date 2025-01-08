#!/usr/bin/env bash

set -o nounset -o xtrace -o errexit -o pipefail

APP_VERSION=$1
STACK=$2
STACK_ENV=${STACK:0:1}
STACK_OWNER=${STACK:1:3}
# This dir will be archived and uploaded to s3 to use in the stacker ECS task
BLUEPRINTS_DIR=${3}

if [ ${STACK_ENV} == "d" ]; then
  AWS_ACCOUNT="dev"
elif [ ${STACK_ENV} == "s" ]; then
  AWS_ACCOUNT="stage"
elif [ ${STACK_ENV} == "p" ]; then
  AWS_ACCOUNT="prod"
elif [ ${STACK_ENV} == "l" ]; then
  AWS_ACCOUNT="load"
else
  echo "Invalid env supplied. Must be one of [d, s, l, p]"
  exit 1
fi

stacker \
    --revision ${STACKER_REVISION} \
    --disable-update \
    --debug \
    --blueprints-dir ${BLUEPRINTS_DIR} \
    --blueprints-version ${APP_VERSION} \
    --command 'build' \
    --manifest 'manifests/excel-add-in.yaml' \
    --region 'us-east-1' \
    --account ${AWS_ACCOUNT} \
    --owner ${STACK_OWNER} \
    --env VersionLabel=${APP_VERSION}
