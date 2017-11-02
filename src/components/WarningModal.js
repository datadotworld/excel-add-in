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
  Modal
} from 'react-bootstrap';

import analytics from '../analytics';
import './WarningModal.css';
import Icon from './icons/Icon';

class WarningModal extends Component {

  static propTypes = {
    analyticsLocation: PropTypes.string,
    dialogMode: PropTypes.oneOf(['save', 'continue']),
    cancelHandler: PropTypes.func,
    children: PropTypes.any,
    successHandler: PropTypes.func
  }

  static defaultProps = {
    analyticsLocation: '',
    dialogMode: 'save'
  }

  cancel = () => {
    analytics.track(`${this.props.analyticsLocation}.warning_modal.cancel.click`);
    this.props.cancelHandler && this.props.cancelHandler();
  };

  success = () => {
    analytics.track(`${this.props.analyticsLocation}.warning_modal.success.click`);
    this.props.successHandler && this.props.successHandler();
  };

  render () {
    const {
      cancelHandler,
      children,
      dialogMode,
      successHandler,
      ...rest
    } = this.props;

    return (<div className="static-modal">
      <Modal {...rest} aria-labelledby='contained-modal-title-sm' className='center-modal warning-modal'>
        <Modal.Body>
          <Icon icon='warning' />
          {children}
        </Modal.Body>

        {dialogMode === 'save' && <Modal.Footer className='save'>
          <Button bsStyle='primary' onClick={cancelHandler}>Cancel</Button>
          <Button onClick={successHandler}>Replace</Button>
        </Modal.Footer>}
        {dialogMode === 'continue' && <Modal.Footer className='continue'>
          <Button bsStyle='link' onClick={successHandler}>Continue</Button>
        </Modal.Footer>}
      </Modal>
    </div>);
  }
}

export default WarningModal;