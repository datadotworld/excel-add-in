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

if (process.env.REACT_APP_ENABLE_ANALYTICS) {
  /* eslint-disable */
  !(function() {
    var analytics = (window.analytics = window.analytics || []);
    if (!analytics.initialize)
      if (analytics.invoked)
        window.console &&
          console.error &&
          console.error('Segment snippet included twice.');
      else {
        analytics.invoked = !0;
        analytics.methods = [
          'trackSubmit',
          'trackClick',
          'trackLink',
          'trackForm',
          'pageview',
          'identify',
          'reset',
          'group',
          'track',
          'ready',
          'alias',
          'page',
          'once',
          'off',
          'on'
        ];
        analytics.factory = function(t) {
          return function() {
            var e = Array.prototype.slice.call(arguments);
            e.unshift(t);
            analytics.push(e);
            return analytics;
          };
        };
        for (var t = 0; t < analytics.methods.length; t++) {
          var e = analytics.methods[t];
          analytics[e] = analytics.factory(e);
        }
        analytics.load = function(t) {
          var e = document.createElement('script');
          e.type = 'text/javascript';
          e.async = !0;
          e.src =
            ('https:' === document.location.protocol ? 'https://' : 'http://') +
            'cdn.segment.com/analytics.js/v1/' +
            t +
            '/analytics.min.js';
          var n = document.getElementsByTagName('script')[0];
          n.parentNode.insertBefore(e, n);
        };
        analytics.SNIPPET_VERSION = '3.1.0';
        analytics.load(process.env.REACT_APP_SEGMENT_ID);
      }
  })();
  /* eslint-enable */
}
