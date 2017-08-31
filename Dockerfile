# Copyright 2017 data.world, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# This product includes software developed at
# data.world, Inc. (http://data.world/).

FROM node:boron

# Create an app directory
WORKDIR /usr/src/app

# Install app depdencies
COPY package.json .
COPY yarn.lock .

RUN yarn install
RUN npm install -g nodemon

COPY . .

RUN REACT_APP_OAUTH_URI=/authorize yarn build

EXPOSE 3001
CMD [ "yarn", "run", "prod" ]
