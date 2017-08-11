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
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { 
  FormControl,
  FormGroup,
  Glyphicon,
  HelpBlock,
  InputGroup
} from 'react-bootstrap'

import './FileInput.css';

const filenameRegex = /^[^/]+$/;
const MAX_FILENAME_LENGTH = 128;

class FileInput extends Component {

  static propTypes = {
    createBinding: PropTypes.func
  }

  state = {
    filename: ''
  }

  filenameChanged = (event) => {
    this.setState({ filename: event.target.value });
  }

  add = () => {
    if (this.isFilenameValid()) {
      this.props.createBinding(this.state.filename);
    }
  }

  isFilenameValid = () => {
    const {filename} = this.state;
    return filename.match(filenameRegex) && filename.length < MAX_FILENAME_LENGTH;
  }

  render () {
    const filenameValid = this.isFilenameValid();
    return (
      <li className='file-input'>
        <FormGroup>
          <InputGroup>
            <FormControl
              onChange={this.filenameChanged}
              value={this.state.filename}
              type='text'
              placeholder='filename' />
            <InputGroup.Addon onClick={this.add} className={filenameValid && 'valid' }>
              <Glyphicon glyph='plus' />
            </InputGroup.Addon>
          </InputGroup>
          <HelpBlock>Enter a filename, maximum 128 characters.  ".csv" will be appended automatically.</HelpBlock>
        </FormGroup>
      </li>
    );
  }
}

export default FileInput;