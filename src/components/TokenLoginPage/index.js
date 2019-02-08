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
import dwLogo from '../../static/img/logo-inline.svg';
import excelLogo from '../../static/img/excel-logo.png';
import sparkleLogo from '../../static/img/new-sparkle-logo.png';

import './TokenLoginPage.css';

export default class TokenLogin extends Component {
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
                stroke-width="2"
              />
            </svg>
          </span>
          <img src={sparkleLogo} alt="data world logo" className="excel-logo" />
          
        </div>
        <div className="divider"></div>
      </div>
    );
  }
}
