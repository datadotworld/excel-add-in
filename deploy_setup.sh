#!/usr/bin/env bash

ECR_ACCOUNT=621799806001

set -o xtrace -o errexit -o pipefail -o nounset

CICD_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Cloning stacker-blueprints repo"
git clone git@github.com:datadotworld/stacker-blueprints.git /root/stacker-blueprints

echo "Cloning dev-tools repo"
git clone git@github.com:datadotworld/dev-tools.git /root/dev-tools

echo "Cloning build-scripts repo"
git clone git@github.com:datadotworld/build-scripts.git /root/build-scripts

echo "Setting up AWS credentials"
/root/build-scripts/cicd/setup_aws_credentials.sh

echo "Fetching ECR login"
$(aws ecr get-login --registry-ids ${ECR_ACCOUNT})
