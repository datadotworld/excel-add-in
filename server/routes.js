/*
 * Copyright 2017 data.world, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This product includes software developed at
 * data.world, Inc. (http://data.world/).
 */

const Path = require('path');
const axios = require('axios');

module.exports = function (server) {
  const endpoint = process.env.OAUTH_AUTHORIZATION_ENDPOINT || 'https://data.world';
  /**
   * The entry point from the OAuth flow.  It will immediately redirect to the
   * data.world authenticator to start the oauth flow.
   */
  server.route({
    method: 'GET',
    path: '/authorize',
    handler: function (req, reply) {
      const client_id = process.env.OAUTH_CLIENT_ID;
      const redirect_uri = process.env.OAUTH_REDIRECT_URI;
      reply.redirect(`${endpoint}/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`);
    }
  });

  /**
   * The oauth callback endpoint.  The data.world oauth flow will return here with a 
   * short term code.  The code should be sent back to data.world to retrieve the long
   * term code and then flow should be redirected to the front end.
   */
  server.route({
    method: 'GET',
    path: '/callback',
    handler: function (req, reply) {
      const redirectAfterExchange = process.env.NODE_ENV === 'production' ? '/' : 'https://localhost:3000/';
      const params = {
        code: req.query.code,
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        grant_type: 'authorization_code'
      };
      const queryString = Object.keys(params).map((k) => {
        return `${k}=${params[k]}`;
      }).join('&');

      axios.post(`${endpoint}/oauth/access_token?${queryString}`).then((response) => {
        if (response.data.access_token) {
          reply().redirect(`${redirectAfterExchange}?token=${response.data.access_token}`);
        } else {
          const errorMessage = response.data.message || 'UNKNOWN_ERROR';
          reply().redirect(`${redirectAfterExchange}?error=${errorMessage}`);  
        }
      }).catch((err) => {
        console.log('Error exchanging short term code for long term token: ', err);
        const errorMessage = err.message || 'UNKNOWN_ERROR';
        reply().redirect(`${redirectAfterExchange}?error=${errorMessage}`);
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/service-worker.js',
    handler: {
      file: {
        path: Path.join(__dirname, '..', 'build', 'service-worker.js')
      }
    }
  });

  /**
   * Serves up the react front end UI
   */
  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, '..', 'build'),
        listing: false
      }
    }
  });
}