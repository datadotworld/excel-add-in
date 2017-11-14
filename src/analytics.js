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

const analyticsEnabled = process.env.REACT_APP_ENABLE_ANALYTICS;

const Analytics = {
  track(event, properties, options) {
    if (analyticsEnabled) {
      window.analytics.track.call(window.analytics, event, properties, options);
    }
  },

  identify(token) {
    if (analyticsEnabled && token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const agent = decoded.sub.split(':')[1]; // should be of the form 'prod-user-client:agentid'
        window.analytics.identify(agent);
      } catch (error) {}
    }
  }
};

export default Analytics;
