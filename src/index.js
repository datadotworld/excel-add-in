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
import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import load from 'little-loader';
import * as Sentry from '@sentry/browser';

import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import TokenLoginPage from './components/TokenLoginPage'

import './index.css';
import './analytics-head';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN
});

function loadApp() {
  ReactDOM.render(
    <ErrorBoundary>
      <IntlProvider locale="en">
        <Router>
          <div>
            <Route
              path="/token-login"
              component={TokenLoginPage}
            />
            <Route component={App} />
          </div>
        </Router>
      </IntlProvider>
    </ErrorBoundary>,
    document.getElementById('root')
  );
}

if (process.env.NODE_ENV === 'production') {
  load('https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js', loadApp);
} else if (process.env.NODE_ENV === 'development') {
  // Load the office debug tools when in dev mode
  load(
    'https://appsforoffice.microsoft.com/lib/1.1/hosted/office.debug.js',
    loadApp
  );
}
