/*
 * Copyright 2018 data.world, Inc.
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
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import './ErrorModal.css';

export default class ErrorBoundary extends Component {
  static propTypes = {
    error: PropTypes.string,
    errorInfo: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      errorInfo: null
    };
  }

  render() {
    return (
      <Modal show={true} className="modal-custom">
        <Modal.Header className="modal-header-custom">
          <Modal.Title className="modal-title-custom">
            Something went wrong
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {this.props.error}
            <details className="modal-error-details">
              {this.props.errorInfo.componentStack}
            </details>
          </div>
          <div className="modal-contact-support">
            <a
              href="https://www.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact support
            </a>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
