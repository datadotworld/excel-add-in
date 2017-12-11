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

import analytics from '../analytics';

import Icon from './icons/Icon';
import WarningModal from './WarningModal';
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
    doesFileExist: PropTypes.func.isRequired,
    excelApiSupported: PropTypes.bool,
    options: PropTypes.object,
    range: PropTypes.object,
    refreshLinkedDataset: PropTypes.func,
    sync: PropTypes.func,
    updateBinding: PropTypes.func
  }

  static defaultProps = {
    options: {}
  }

  state = {
    isSubmitting: false,
    name: this.props.options.filename ? getFilenameWithoutExtension(this.props.options.filename) : '',
    showWarningModal: false,
    selectSheet: false
  }

  isFormValid = () => {
    const { name } = this.state;
    const { excelApiSupported, range } = this.props;
    if ((excelApiSupported && !range) || !name) {
      return false;
    }
    return name.match(filenameRegex) && name.length < MAX_FILENAME_LENGTH;
  }

  submitBinding = () => {
    this.closeModal();
    const {
      close,
      createBinding,
      options,
      refreshLinkedDataset,
      sync,
      updateBinding,
      range
    } = this.props;
    const { name, selectSheet } = this.state;

    const sheet = `Sheet${this.getSheetNumber(range)}`;
    const allRows = 1048576;
    const selection = {
      name: `${name}.csv`,
      sheet,
      range: selectSheet ? `A1:ET${allRows}` : range.address
    };

    if (options.binding) {
      updateBinding(options.binding, selection)
        .then(sync)
        .then(refreshLinkedDataset)
        .then(close);
    } else {
      createBinding(selection).then((binding) => {
        // Binding has been created, but the file does not exist yet, sync the file
        sync(binding).then(refreshLinkedDataset).then(close);
      })
    }
  }

  submit = (event) => {
    analytics.track('exceladdin.add_data.submit.click');
    event.preventDefault();

    if (this.props.options.filename || this.props.doesFileExist(`${this.getFilename(this.state.name)}.csv`)) {
      // Show warning modal
      this.setState({ showWarningModal: true });
    } else {
      this.submitBinding();
    }
  }

  closeModal = () => {
    this.setState({ showWarningModal: false });
  }

  /**
   * Peels off a trailing .csv if the user added it
   */
  getFilename = () => {
    const index = this.state.name.lastIndexOf('.csv');
    if (index >= 0 && index === this.state.name.length - 4) {
      return getFilenameWithoutExtension(this.state.name);
    }
    return this.state.name;
  }

  closeClicked = () => {
    analytics.track('exceladdin.add_data.close.click');
    this.props.close();
  }

  cancelClicked = () => {
    analytics.track('exceladdin.add_data.cancel.click');
    this.props.close();
  }

  getSheetNumber = (range) => {
    if (range) {
      const address = range.address;
      const sheet = address.substring(0, address.indexOf('!'));
      const sheetNumber = sheet.match(/[0-9]+/);
      return sheetNumber;
    }

    return ''
  }

  changeSelection = (event) => {
    const { value } = event.target

    if (value === 'selection') {
      this.setState({ selectSheet: false})
    } else if (value === 'sheet') {
      this.setState({ selectSheet: true });
    }
  }

  getSelectionText(range) {
    if (range) {
      const rowsInSheet = 1048576;
      const maxColumns = 150;

      // Return sheet number if entire sheet is selected
      if (range.rowCount ===  rowsInSheet && range.columnCount === maxColumns) {
        const selection = range.address;
        const sheet = selection.substring(0, selection.indexOf('!'));
        return `(${sheet})`;
      }

      // Return number of rows and columns in selection
      const rowCount = range.rowCount;
      const columnCount = range.columnCount;
      const rowText = rowCount === 1 ? 'Row' : 'Rows';
      const columnText = columnCount === 1 ? 'Column' : 'Columns';

      return `(${rowCount} ${rowText} x ${columnCount} ${columnText})`;
    }

    // Range no yet loaded, return placeholder text
    return '(Rows x Columns)';
  }

  render () {
    const { name, selectSheet } = this.state;
    const { excelApiSupported, options, range } = this.props;

    let validState, displayName, selection;

    if (name) {
      validState = this.isFormValid() ? 'success' : 'warning'
      displayName = this.getFilename();
    }

    if (selectSheet) {
      selection = range ? `Sheet${this.getSheetNumber(range)}` : '';
    } else {
      selection = range ? range.address : '';
    }

    return (
      <Grid className='add-data-modal full-screen-modal show'>
        <Row className='center-block header'>
          <div className='title'>
            Add data <Icon icon='close' className='close-button' onClick={this.closeClicked} />
          </div>
        </Row>
        <Row className='center-block'>
          <form onSubmit={this.submit}>
            {excelApiSupported &&
            <form className='selection-form' onClick={this.changeSelection}>
              <div className='selection'>
                <label className='radio-button'>
                  <input type='radio' name='selection' value='selection' defaultChecked />
                  <span>Selection</span>
                </label>
                <div className='selection-info'>
                  {
                    this.getSelectionText(range)
                  }
                </div>
              </div>
              <div className='selection'>
                <label className='radio-button'>
                  <input type='radio' name='selection' value='sheet' />
                  <span>Sheet</span>
                </label>
                <div className='selection-info'>
                  {`(Sheet ${this.getSheetNumber(range)})`}
                </div>
              </div>
              <HelpBlock>
                {
                  selectSheet ?
                  'Select the sheet you\'d like to add, it will be refelected here.' :
                  'Select the area to bind in the worksheet, it will be reflected here.'
                }
              </HelpBlock>
            </form>}
            {!excelApiSupported && <div>
              <ControlLabel>Dataset range</ControlLabel>
              <HelpBlock>
                Select the area to bind in the worksheet.
              </HelpBlock>
            </div>}
            <FormGroup validationState={validState}>
              <ControlLabel>Name</ControlLabel>
              <InputGroup>
                <FormControl
                  onChange={(event) => this.setState({name: event.target.value})}
                  value={name}
                  disabled={!!options.filename}
                  type='text' />
              </InputGroup>
              <HelpBlock>
                Must not include slashes, your file will be named <strong>{displayName}.csv</strong>
                <div className='titleLimit'>max. 128</div>
              </HelpBlock>
            </FormGroup>
            <div className='button-group'>
              <Button onClick={this.cancelClicked}>Cancel</Button>
              <Button
                type='submit'
                disabled={this.state.isSubmitting || validState !== 'success'}
                bsStyle='primary'>OK</Button>
            </div>
          </form>
        </Row>
        <WarningModal
          show={this.state.showWarningModal}
          cancelHandler={this.closeModal}
          successHandler={this.submitBinding}
          analyticsLocation='exceladdin.add_data'>
          <div><strong>"{displayName}.csv" already exists on data.world.  Do you want to replace it?</strong></div>
          <div>Replacing it will overwrite the file on data.world with the contents from {excelApiSupported ? selection : 'the selected cell range'}</div>
        </WarningModal>
      </Grid>);
  }
}

export default AddDataModal;