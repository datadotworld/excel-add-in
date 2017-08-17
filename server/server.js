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
const hapi = require('hapi');
const inert = require('inert');

const server = new hapi.Server();

server.register([inert], (error) => {
  if (error) {
    throw error;
  }

  let tls;
  if (process.env.HTTPS === 'true' && process.env.NODE_ENV !== 'production') {
    // Create a self signed cert.  This should only be used for local testing
    const attributes = [{name: 'commonName', value: 'localhost'}];
    const pems = require('selfsigned').generate(attributes, { algorithm: 'sha256', days: 30, keySize: 2048});
    tls = {
      key: pems.private,
      cert: pems.cert
    };
  }

  server.connection({
    tls,
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 3001
  });

  require('./routes')(server);

  server.start((error) => {
    if (error) {
      throw error;
    }

    for (const connection of server.connections) {
      console.log(`${connection.settings.labels} server running at ${connection.info.uri}`)
    }
  });

});