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

import './TokenLoginPage.css';

export default class TokenLogin extends Component {
  render() {
    return (
      <div className="token-login">
        <img src={dwLogo} alt="data world logo" className="header-logo" />
      </div>
    );
  }
}
