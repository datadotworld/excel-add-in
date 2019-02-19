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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, Row } from 'react-bootstrap';

import LogoStacked from './icons/LogoStacked';
import LibraryItem from './LibraryItem';
import insightsIcon from '../static/img/icon_insight_round.svg';
import datasetIcon from '../static/img/icon_dataset_round.svg';
import importIcon from '../static/img/icon_import_round.svg';

import './WelcomePage.css';
import analytics from '../analytics';

class WelcomePage extends Component {
  static propTypes = {
    dataset: PropTypes.object,
    page: PropTypes.string,
    version: PropTypes.string
  };

  constructor(props) {
    super();
    this.oauthURI = `${process.env.REACT_APP_OAUTH_URI || '/authorize'}?page=${
      props.page
    }`;
  }

  startAuthFlow = () => {
    window.location = this.oauthURI;
  };

  loginClick = () => {
    analytics.track('exceladdin.welcome.login.click');
    this.startAuthFlow();
  };

  signUpClick = () => {
    analytics.track('exceladdin.welcome.signup.click');
  };

  render() {
    const { dataset, version } = this.props;
    const v1LandingPage = (
      <Grid className="welcome-page">
        <Row className="center-block">
          <LogoStacked />
          {!dataset && (
            <div>
              <div className="description">
                <p>
                  Turn Excel files into
                  <br />
                  data.world datasets
                </p>
                <p>
                  Collaborate with
                  <br />
                  other Excel users
                </p>
                <p>
                  Sync changes to data.world
                  <br />
                  with a single click
                </p>
              </div>
            </div>
          )}
          {dataset && (
            <div>
              <div>This file is linked to a dataset on data.world:</div>
              <LibraryItem
                library={dataset}
                buttonText="View"
                buttonLink={`https://data.world/${dataset.owner}/${dataset.id}`}
              />
              <div className="message">
                Sign in to data.world to save changes as they are made.
              </div>
            </div>
          )}
          <Button
            className="center-block login-button"
            onClick={this.loginClick}
            bsStyle="primary"
          >
            Sign in
          </Button>
          <div>
            {'New to data.world? '}
            <a
              href="https://data.world/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={this.signUpClick}
            >
              {'Sign up now'}
            </a>
          </div>
        </Row>
      </Grid>
    );

    const v2LandingPage = (
      <Grid className="welcome-page welcome-page-v2">
        <Row className="center-block">
          <LogoStacked />
          <div className="feature">
            <img
              alt="insights logo"
              src={insightsIcon}
              className="feature-icon"
            />
            <p className="feature-text">Publish charts as insights</p>
          </div>
          <div className="feature">
            <img
              alt="insights logo"
              src={datasetIcon}
              className="feature-icon"
            />
            <p className="feature-text">Save your data on data.world</p>
          </div>
          <div className="feature">
            <img
              alt="insights logo"
              src={importIcon}
              className="feature-icon"
            />
            <p className="feature-text">Import datasets into Excel</p>
          </div>
          <Button
            className="center-block login-button"
            onClick={this.loginClick}
            bsStyle="primary"
          >
            Sign in
          </Button>
          <div>
            <span>Or use an </span>
            <a
              href="/token-login"
              className="link"
            >
              access code
            </a>
          </div>
          <div>
            {`New to data.world? `}
            <a
              href="https://data.world/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={this.signUpClick}
              className="link"
            >
              Sign up now
            </a>
          </div>
        </Row>
      </Grid>
    );

    if (version === '1.1.0.0') {
      return v2LandingPage;
    }
    return v1LandingPage;
  }
}

export default WelcomePage;
