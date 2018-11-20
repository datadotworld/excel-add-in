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
import PropTypes from 'prop-types';

import {
  Button,
  Grid,
  Image,
  Row,
  HelpBlock,
  FormControl,
  InputGroup,
  ControlLabel,
  FormGroup
} from 'react-bootstrap';
import {
  MAX_FILENAME_LENGTH,
  SHEET_RANGE,
  MAX_COLUMNS,
  MAX_COLUMNS_ERROR
} from '../constants';
import { getDisplayRange, getDestination } from '../util';
import analytics from '../analytics';

import WarningModal from './WarningModal';
import './UploadModal.css';

const upload = require('./icons/icon-upload-white.svg');

const getFilenameWithoutExtension = function(filename) {
  const dotPos = filename.lastIndexOf('.');
  return dotPos > -1 ? filename.slice(0, dotPos) : filename;
};

export default class UploadModal extends Component {
  static propTypes = {
    excelApiSupported: PropTypes.bool,
    range: PropTypes.object
  };

  state = {
    filename: '',
    fileNameValid: { errorMessage: '' },
    currentUrl: this.props.url,
    showWarningModal: false
  };

  componentDidMount() {
    // To show number of rows and columns selected
    this.props.getSelectionRange();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.url !== this.props.url) {
      this.setState({ currentUrl: this.props.url });
    }
  }

  fileNameValid(filename) {
    if (filename.indexOf('/') > -1) {
      return {
        valid: false,
        errorMessage: 'Cannot use slashes in fie names.'
      };
    }

    if (filename.length > MAX_FILENAME_LENGTH) {
      return {
        valid: false,
        errorMessage: 'Filename cannot be longer than 128 characters'
      };
    }

    return { valid: true };
  }

  handleFileChange = (event) => {
    const { value } = event.currentTarget;

    this.setState({
      filename: value,
      fileNameValid: this.fileNameValid(value)
    });
  };

  isFormValid = () => {
    const { fileNameValid, currentUrl } = this.state;

    return fileNameValid.valid && currentUrl.length > 0;
  };

  getSelectionText(range) {
    if (range) {
      // Return number of rows and columns in selection
      const rowCount = range.rowCount;
      const columnCount = range.columnCount;
      const rowText = rowCount === 1 ? 'Row' : 'Rows';
      const columnText = columnCount === 1 ? 'Column' : 'Columns';

      return `(${rowCount} ${rowText} x ${columnCount} ${columnText})`;
    }

    // Range not yet loaded, return placeholder text
    return '(Rows x Columns)';
  }

  getSheetName = (range) => {
    if (range) {
      const address = range.address;
      // Extract sheet name and trim quote marks which are added when the name has a space
      const sheet = address
        .substring(0, address.indexOf('!'))
        .replace(/'/g, '');
      return sheet;
    }

    return '';
  };

  submitFile = async () => {
    this.closeModal();
    const {
      close,
      sync,
      setError,
      setErrorMessage,
      selectSheet,
      getSelectionRange
    } = this.props;
    const { filename, currentUrl } = this.state;
    const dataset = getDestination(currentUrl);

    if (dataset) {
      try {
        const range = await getSelectionRange();
        const { columnCount } = range;

        if (columnCount >= MAX_COLUMNS) {
          this.props.setErrorMessage(MAX_COLUMNS_ERROR);
        } else {
          let rangeAddress = range.address;
          if (rangeAddress) {
            if (selectSheet) {
              const [sheet] = rangeAddress.split('!');
              rangeAddress = `${sheet}!${SHEET_RANGE}`;
            }

            await sync(
              `${filename}.csv`,
              rangeAddress.replace(/'/g, ''),
              dataset,
              range.worksheet.id
            );
            await close();
          }
        }
      } catch (selectionRangeError) {
        setError(selectionRangeError);
      }
    } else {
      setErrorMessage('Invalid dataset or project URL');
    }
  };

  submit = (event) => {
    const { filename } = this.state;
    analytics.track('exceladdin.add_data.submit.click');
    event.preventDefault();

    if (this.props.doesFileExist(`${filename}.csv`)) {
      // Show warning modal
      this.setState({ showWarningModal: true });
    } else {
      this.submitFile();
    }
  };

  getFilename = () => {
    const index = this.state.name.lastIndexOf('.csv');
    if (index >= 0 && index === this.state.name.length - 4) {
      return getFilenameWithoutExtension(this.state.name);
    }
    return this.state.name;
  };

  closeModal = () => {
    this.setState({ showWarningModal: false });
  };

  cancelClicked = () => {
    analytics.track('exceladdin.add_data.cancel.click');
    this.props.close();
  };

  handleUrlChange(url) {
    this.setState({ currentUrl: url });
  }

  render() {
    const {
      excelApiSupported,
      range,
      numItemsInHistory,
      selectSheet,
      loading
    } = this.props;
    const { filename, fileNameValid } = this.state;
    let selection;

    if (selectSheet) {
      selection = range ? this.getSheetName(range) : '';
    } else {
      selection = range ? range.address : '';
    }

    return (
      <div>
        <div className="full-screen-modal category-title">
          <ControlLabel>Upload data</ControlLabel>
        </div>
        <Grid className="upload-modal full-screen-modal  ">
          <Row className="center-block">
            <form className="upload-form" onSubmit={this.submit}>
              {excelApiSupported && (
                <FormGroup className="upload-from">
                  <ControlLabel className="upload-from-title">
                    Upload from:
                  </ControlLabel>
                  <div
                    className="upload-selection-form"
                    onClick={this.props.changeSelection}
                  >
                    <div className="selection">
                      <label className="radio-button">
                        <input
                          type="radio"
                          name="selection"
                          value="selection"
                          checked={!selectSheet}
                          readOnly
                        />
                        <span className="selection-text">
                          Current selection
                        </span>
                      </label>
                      <div className="selection-info">
                        {this.getSelectionText(range)}
                      </div>
                    </div>
                    <div className="selection">
                      <label className="radio-button">
                        <input
                          type="radio"
                          name="selection"
                          value="sheet"
                          checked={selectSheet}
                          readOnly
                        />
                        <span className="selection-text">Current sheet</span>
                      </label>
                      <div className="selection-info">
                        {`(${this.getSheetName(range)})`}
                      </div>
                    </div>
                  </div>
                </FormGroup>
              )}
              <div className="upload-to">
                <FormGroup className="url-group">
                  <div className="body">
                    <ControlLabel>Save data to:</ControlLabel>
                    <InputGroup>
                      <div className="url">
                        <FormControl
                          className="textField"
                          placeholder="Insert Dataset or Project URL"
                          value={this.state.currentUrl}
                          type="text"
                          onChange={(event) => {
                            this.handleUrlChange(event.target.value);
                          }}
                        />
                        <Button
                          className="browse-button"
                          onClick={() => this.props.showDatasets()}
                        >
                          Browse
                        </Button>
                      </div>
                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup>
                  <div className="upload-file-title-container">
                    <ControlLabel>File name:</ControlLabel>
                    <div className="upload-titleLimit">128 char max</div>
                  </div>
                  <InputGroup>
                    <FormControl
                      value={filename}
                      className={
                        fileNameValid.valid === false
                          ? 'textField-file-error'
                          : 'textField-file'
                      }
                      placeholder="Create new file name"
                      type="text"
                      onChange={this.handleFileChange}
                    />
                  </InputGroup>
                  {!fileNameValid.errorMessage && (
                    <HelpBlock className="filename-help">
                      Your file will appear with the .csv extension. You can
                      always change the name later.
                    </HelpBlock>
                  )}
                  {fileNameValid.errorMessage && (
                    <HelpBlock className="filename-help-error">
                      {fileNameValid.errorMessage}
                    </HelpBlock>
                  )}
                </FormGroup>

                <div className="uplaod-data-buttons">
                  {numItemsInHistory !== 0 && (
                    <Button
                      className="upload-cancel-button"
                      onClick={this.cancelClicked}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}

                  <Button
                    type="submit"
                    bsStyle="primary"
                    className={
                      numItemsInHistory !== 0
                        ? 'upload-button-upload'
                        : 'upload-button-upload-full'
                    }
                    disabled={loading || !this.isFormValid()}
                  >
                    <Image className="icon-upload-white" src={upload} />
                    {loading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </form>
          </Row>
          <WarningModal
            show={this.state.showWarningModal}
            cancelHandler={this.closeModal}
            successHandler={this.submitFile}
            analyticsLocation="exceladdin.add_data"
          >
            <div>
              <strong>
                "{filename}
                .csv" already exists on data.world. Do you want to replace it?
              </strong>
            </div>
            <div>
              Replacing it will overwrite the file on data.world with the
              contents from{' '}
              {excelApiSupported
                ? getDisplayRange(selection)
                : 'the selected cell range'}
            </div>
          </WarningModal>
        </Grid>
      </div>
    );
  }
}
