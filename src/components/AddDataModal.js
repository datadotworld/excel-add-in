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
  ControlLabel,
  FormControl,
  FormGroup,
  Grid,
  HelpBlock,
  InputGroup,
  Row
} from 'react-bootstrap';

import Icon from './icons/Icon';

import './AddDataModal.css';

const filenameRegex = /^[^/]+$/;
const MAX_FILENAME_LENGTH = 128;

const getFilenameWithoutExtension = function (filename) {
  const dotPos = filename.lastIndexOf('.');
  return dotPos > -1 ? filename.slice(0, dotPos) : filename;
}

class AddDataModal extends Component {
  static propTypes = {
    close: PropTypes.func,
    createBinding: PropTypes.func,
    file: PropTypes.string,
    range: PropTypes.string,
    refreshLinkedDataset: PropTypes.func,
    sync: PropTypes.func
  }

  state = {
    isSubmitting: false,
    name: this.props.file ? getFilenameWithoutExtension(this.props.file) : ''
  }

  isFormValid = () => {
    const { name } = this.state;
    const { range } = this.props;
    if (!range || !name) {
      return false;
    }
    return name.match(filenameRegex) && name.length < MAX_FILENAME_LENGTH;
  }

  submit = (event) => {
    event.preventDefault();
    const { close, createBinding, refreshLinkedDataset, sync } = this.props;
    createBinding(`${this.state.name}.csv`).then((binding) => {
      if (! this.props.file) {
        // Binding has been created, but the file does not exist yet, sync the file
        sync(binding).then(refreshLinkedDataset).then(close);
      } else {
        close();
      }
    });
  }

  render () {
    const { name } = this.state;
    const { close, file, range } = this.props;

    let validState;

    if (name) {
      validState = this.isFormValid() ? 'success' : 'warning'
    }

    return (
      <Grid className='add-data-modal modal show'>
        <Row className='center-block header'>
          <div className='title'>
            Add data <Icon icon='close' className='close-button' onClick={close} />
          </div>
        </Row>
        <Row className='center-block'>
          <form onSubmit={this.submit}>
            <FormGroup>
              <ControlLabel>Dataset range</ControlLabel>
              <InputGroup>
                <FormControl
                  value={range}
                  disabled
                  type='text' />
              </InputGroup>
              <HelpBlock>
                Select the area to bind in the worksheet, it will be reflected here.
              </HelpBlock>  
            </FormGroup>

            <FormGroup validationState={validState}>
              <ControlLabel>Name</ControlLabel>
              <InputGroup>
                <FormControl
                  onChange={(event) => this.setState({name: event.target.value})}
                  value={name}
                  disabled={!!file}
                  type='text' />
              </InputGroup>
              <HelpBlock>
                Must not include slashes, your file will be named <strong>{name}.csv</strong>
                <div className='titleLimit'>max. 128</div>
              </HelpBlock>
            </FormGroup>
            <div className='button-group'>
              <Button onClick={close}>Cancel</Button>
              <Button
                type='submit'
                disabled={this.state.isSubmitting || validState !== 'success'}
                bsStyle='primary'>Add selection</Button>
            </div>
          </form>
        </Row>
      </Grid>);
  }
}

export default AddDataModal;