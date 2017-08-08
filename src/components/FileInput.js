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