/*
 * Copyright 2019 data.world, Inc.
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
import {
  Button,
  FormControl,
  FormGroup,
  Glyphicon,
  HelpBlock,
  InputGroup
} from 'react-bootstrap';
import DataDotWorldApi from '../../DataDotWorldApi';
import dwLogo from '../../static/img/logo-inline.svg';
import excelLogo from '../../static/img/excel-logo.png';
import sparkleLogo from '../../static/img/new-sparkle-logo.png';

import './TokenLoginPage.css';

export default class TokenLogin extends Component {
  state = { code: '', validation: null };

  handleChange = (e) => {
    this.setState({ code: e.target.value, validation: null });
  };

  submit = async () => {
    const { code } = this.state;
    this.setState({ submitting: true });

    const api = new DataDotWorldApi(code);

    try {
      await api.getUser();

      // Code valid, redirect user to app
      window.location.assign(`https://localhost:3000/?token=${code}`);
    } catch (error) {
      this.setState({ submitting: false, validation: 'error' });
    }
  };

  render() {
    return (
      <div className="token-login">
        <img src={dwLogo} alt="data world long logo" className="header-logo" />
        <div className="auth-logos">
          <img src={excelLogo} alt="excel logo" className="excel-logo" />
          <span className="svg-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.orgg/2000/svg"
            >
              <path
                className="stroke"
                d="M1 7.2L5.9 12.1 15 3"
                strokeWidth="2"
              />
            </svg>
          </span>
          <img src={sparkleLogo} alt="data world logo" className="excel-logo" />
        </div>
        <div className="divider" />
        <div className="form-container">
          <div className="form-header">Enter your data.world access code</div>
          <div className="form">
            <div className="help-text">
              Need help locating your access code?{' '}
              <a
                href="https://help.data.world/"
                target="_blank"
                rel="noopener noreferrer"
              >
                See FAQ
              </a>
            </div>
            <div>
              <FormGroup validationState={this.state.validation}>
                <InputGroup>
                  <InputGroup.Addon>
                    <Glyphicon glyph="lock" />
                  </InputGroup.Addon>
                  <FormControl
                    type="text"
                    placeholder="Access code"
                    value={this.state.code}
                    onChange={this.handleChange}
                  />
                </InputGroup>
                {this.state.validation && <HelpBlock>Invalid code</HelpBlock>}
              </FormGroup>
            </div>
            <Button
              bsStyle="primary"
              className="continue-button"
              onClick={this.submit}
            >
              {this.state.submitting ? 'Submitting...' : 'Continue'}
            </Button>
          </div>
        </div>
        <div className="sign-up">
          New to data.world?{' '}
          <a
            href="https://data.world/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sign up now
          </a>
        </div>
      </div>
    );
  }
}
