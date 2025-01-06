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

ARG segment_id

ENV REACT_APP_ENABLE_ANALYTICS=true
ENV REACT_APP_OAUTH_URI=/authorize
ENV REACT_APP_SEGMENT_ID=$segment_id
ENV REACT_APP_SENTRY_DSN="https://811b61389fba4f0ab15fffe055c477f9@o35227.ingest.us.sentry.io/1293911"

RUN mkdir -p  /var/log/nginx && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

ADD etc/nginx/ /etc/nginx/
RUN chown -R root:root /etc/nginx/ \
    && chmod 644 -R /etc/nginx/**/*.conf
VOLUME "/etc/nginx/conf.d"

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile
RUN npm install -g nodemon

COPY . .

RUN yarn build

EXPOSE 3001

CMD [ "yarn", "run", "prod" ]
