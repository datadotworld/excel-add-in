#!/bin/bash
set -o xtrace -o errexit  -o pipefail
ECR_ACCOUNT=621799806001

d=$(dirname "$0")

if [ -z "$1" ]; then
    APP_VERSION=$(${d}/generate_app_version.sh)
else
    APP_VERSION=$1
fi

APP_DIR="${d}/"

build_and_push () {
  image_tag="${ECR_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/${1}:${2}"
  if [ -z $(docker images -q ${image_tag}) ]; then
    docker build --build-arg segment_id=${SEGMENT_ID} --rm=false -t ${image_tag} .
  else
    echo "Image already built"
  fi

docker push ${image_tag}
}

pushd ${APP_DIR}
build_and_push excel-add-in ${APP_VERSION}
popd
