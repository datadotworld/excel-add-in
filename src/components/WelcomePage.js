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

import './WelcomePage.css';
import LogoStacked from './icons/LogoStacked';
import DatasetItem from './DatasetItem';
import analytics from '../analytics';

class WelcomePage extends Component {

  static propTypes = {
    dataset: PropTypes.object
  }

  constructor () {
    super();
    this.oauthURI = process.env.REACT_APP_OAUTH_URI;
  }

  componentWillMount = () => {
    document.body.style.backgroundColor = '#335c8c';
  }
  
  componentWillUnmoun = () => {
    document.body.style.backgroundColor = null;
  }

  startAuthFlow = () => {
    window.location = this.oauthURI;
  }

  loginClick = () => {
    analytics.track('exceladdin.welcome.login.click');
  }

  signUpClick = () => {
    analytics.track('exceladdin.welcome.signup.click');
  }

  render () {
    const {dataset} = this.props;
    return (
      <Grid className='welcome-page'>
        <Row className='center-block'>
          <LogoStacked />
          {!dataset && <div>
            <div className='description'>
              <p>Turn Excel files into<br />data.world datasets</p>
              <p>Collaborate with<br />other Excel users</p>
              <p>Sync changes to data.world<br />with a single click</p>
            </div>
          </div>}
          {dataset && <div>
            <div>This file is linked to a dataset on data.world:</div>
            <DatasetItem dataset={dataset} buttonText='View' buttonLink={`https://data.world/${dataset.owner}/${dataset.id}`} />
            <div className='message'>Sign in to data.world to save changes as they are made.</div>
          </div>}
          <Button
            className='center-block login-button'
            href={this.oauthURI}
            onClick={this.loginClick}
            bsStyle='primary'>Sign in</Button>
          <div>New to data.world? <a href='https://data.world/' target='_blank' rel='noopener noreferrer' onClick={this.signUpClick}> Sign up now</a></div>
        </Row>
      </Grid>
    );
  }
}

export default WelcomePage;