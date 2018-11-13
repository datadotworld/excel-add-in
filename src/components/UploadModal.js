import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Grid,
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
import { getDisplayRange } from '../util';
import analytics from '../analytics';

import WarningModal from './WarningModal';
import './UploadModal.css';

const getFilenameWithoutExtension = function(filename) {
  const dotPos = filename.lastIndexOf('.');
  return dotPos > -1 ? filename.slice(0, dotPos) : filename;
};

const filenameRegex = /^[^/]+$/;

export default class UploadModal extends Component {
  static propTypes = {
    excelApiSupported: PropTypes.bool,
    range: PropTypes.object
  };

  state = {
    filename: '',
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

  isFormValid = () => {
    const { filename } = this.state;
    const { excelApiSupported, range } = this.props;
    if ((excelApiSupported && !range) || !filename) {
      return false;
    }
    return (
      filename.match(filenameRegex) && filename.length < MAX_FILENAME_LENGTH
    );
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
      selectSheet,
      getSelectionRange
    } = this.props;
    const { filename } = this.state;

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
            this.state.currentUrl,
            range.worksheet.id
          );
          await close();
        }
      }
    } catch (selectionRangeError) {
      setError(selectionRangeError);
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
      selectSheet
    } = this.props;
    const { filename } = this.state;
    let validState, selection;
    if (filename) {
      validState = this.isFormValid() ? 'success' : 'warning';
    }

    if (selectSheet) {
      selection = range ? this.getSheetName(range) : '';
    } else {
      selection = range ? range.address : '';
    }

    return (
      <div>
        <div className="full-screen-modal category-title">
          <ControlLabel>Upload to data.world</ControlLabel>
        </div>
        <Grid className="upload-modal full-screen-modal  ">
          <Row className="center-block">
            <form onSubmit={this.submit}>
              {excelApiSupported && (
                <FormGroup>
                  <ControlLabel>Select the area or sheet to save:</ControlLabel>
                  <div
                    className="selection-form"
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
                        <span>Selection</span>
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
                        <span>Sheet</span>
                      </label>
                      <div className="selection-info">
                        {`(${this.getSheetName(range)})`}
                      </div>
                    </div>
                  </div>
                </FormGroup>
              )}
              <FormGroup className="url-group" validationState={validState}>
                <div className="body">
                  <ControlLabel>Dataset or project URL:</ControlLabel>
                  <InputGroup>
                    <div className="url">
                      <FormControl
                        className="textField"
                        placeholder="https://data.world/"
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
                  <HelpBlock className="help-block">
                    Copy/paste the URL of a dataset or project, or click
                    "Browse"
                  </HelpBlock>
                </div>
              </FormGroup>
              <FormGroup validationState={validState}>
                <ControlLabel>File name:</ControlLabel>
                <InputGroup>
                  <FormControl
                    value={filename}
                    className="textField"
                    type="text"
                    onChange={({ target }) => {
                      this.setState({ filename: target.value });
                    }}
                  />
                </InputGroup>
                <HelpBlock>
                  Must not include slashes, your file will be named{' '}
                  <strong>
                    {filename}
                    .csv
                  </strong>
                  <div className="titleLimit">max. 128</div>
                </HelpBlock>
              </FormGroup>
              <div className="button-group">
                {numItemsInHistory !== 0 && (
                  <Button
                    className="cancel-button"
                    onClick={this.cancelClicked}
                  >
                    Cancel
                  </Button>
                )}
                {this.props.loading ? (
                  <Button
                    type="submit"
                    className={
                      numItemsInHistory !== 0
                        ? 'submit-button'
                        : 'full-submit-button'
                    }
                    disabled
                    bsStyle="primary"
                  >
                    Saving...
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className={
                      numItemsInHistory !== 0
                        ? 'submit-button'
                        : 'full-submit-button'
                    }
                    bsStyle="primary"
                  >
                    Save file
                  </Button>
                )}
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
