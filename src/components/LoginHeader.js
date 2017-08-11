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
  DropdownButton,
  MenuItem
} from 'react-bootstrap';

import './LoginHeader.css';
import sparkle from '../static/img/new-sparkle-logo.png';

class LoginHeader extends Component {

  static propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func
  }

  userMenuChanged = () => {
    this.props.logout();
  }

  render () {
    const { user } = this.props;

    return (
      <div className='login-header'>
        <img src={sparkle} alt='data.world sparkle logo' />
        <span className='title'>data.world</span>
        {user && <DropdownButton title={user.id} pullRight bsSize='small' onSelect={this.userMenuChanged} id='dropdown-user'>
          <MenuItem eventKey='signout'>Sign out</MenuItem>
        </DropdownButton>}
      </div>
    );
  }
}

export default LoginHeader;