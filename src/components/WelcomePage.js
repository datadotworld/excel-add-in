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
import { 
  Button,
  Grid,
  Row
} from 'react-bootstrap';

import LogoStacked from './icons/LogoStacked';
import insightsIcon from '../static/img/icon_insight_round.svg';
import datasetIcon from '../static/img/icon_dataset_round.svg';
import importIcon from '../static/img/icon_import_round.svg';

import './WelcomePage.css';
import analytics from '../analytics';

class WelcomePage extends Component {

  static propTypes = {
    page: PropTypes.string
  }

  constructor (props) {
    super();
    this.oauthURI = `${process.env.REACT_APP_OAUTH_URI}?page=${props.page}`;
  }

  startAuthFlow = () => {
    window.location = this.oauthURI;
  }

  loginClick = () => {
    analytics.track('exceladdin.welcome.login.click');
    this.startAuthFlow();
  }

  signUpClick = () => {
    analytics.track('exceladdin.welcome.signup.click');
  }

  render () {
    return (
      <Grid className='welcome-page'>
        <Row className='center-block'>
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
            className='center-block login-button'
            onClick={this.loginClick}
            bsStyle='primary'
          >
            Sign in
          </Button>
          <div>
            {`New to data.world? `}
            <a
              href='https://data.world/'
              target='_blank'
              rel='noopener noreferrer'
              onClick={this.signUpClick}
              className="sign-up-link"
            >
              Sign up now
            </a>
          </div>
        </Row>
      </Grid>
    );
  }
}

export default WelcomePage;
