import React from 'react';
import ReactDOM from 'react-dom';
import {IntlProvider} from 'react-intl';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import load from 'little-loader';

function loadApp () {
  ReactDOM.render(<IntlProvider locale="en"><App /></IntlProvider>, document.getElementById('root'));
  registerServiceWorker();
}

if (process.env.NODE_ENV === 'production') {
  load('https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js', loadApp);
} else if (process.env.NODE_ENV === 'development') {
  // Load the office debug tools when in dev mode
  load('https://appsforoffice.microsoft.com/lib/1.1/hosted/office.debug.js', loadApp);
}
