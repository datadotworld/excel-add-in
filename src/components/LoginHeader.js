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