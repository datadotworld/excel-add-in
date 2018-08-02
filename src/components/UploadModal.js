import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { 
  Button,
  DropdownButton,
  Grid,
  MenuItem,
  Row,
  HelpBlock,
  FormControl,
  InputGroup,
  ControlLabel,
  FormGroup
} from 'react-bootstrap';
import { MAX_FILENAME_LENGTH, SHEET_RANGE } from '../constants';
import analytics from '../analytics';

import DatasetItem from './DatasetItem';
import Icon from './icons/Icon';
import WarningModal from './WarningModal';
import './UploadModal.css';
import DatasetsView from './DatasetsView';


class UploadModal extends Component {
  static propTypes = {
    excelApiSupported: PropTypes.bool,
    range: PropTypes.object,
    updateBinding: PropTypes.func
  }

  state = {
    sortKey: 'updated',
    selectSheet: false
  }

  getSelectionText(range) {
    if (range) {
      // Return number of rows and columns in selection
      const rowCount = range.rowCount
      const columnCount = range.columnCount
      const rowText = rowCount === 1 ? 'Row' : 'Rows'
      const columnText = columnCount === 1 ? 'Column' : 'Columns'

      return `(${rowCount} ${rowText} x ${columnCount} ${columnText})`
    }

    // Range not yet loaded, return placeholder text
    return '(Rows x Columns)';
  }

  getSheetName = (range) => {
    if (range) {
      const address = range.address;
      // Extract sheet name and trim quote marks which are added when the name has a space
      const sheet = address.substring(0, address.indexOf('!')).replace(/'/g, '');
      return sheet;
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

    const selection = {
      name: `${name}.csv`,
      sheetId: range.worksheet.id,
      range: selectSheet ? SHEET_RANGE : range.address
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

  render () {
    const { datasets, excelApiSupported, range, showDatasets } = this.props;
    const { sortKey, selectSheet } = this.state
    let validState, displayName, selection;
    console.log("range", range)

    if (selectSheet) {
      selection = range ? this.getSheetName(range) : '';
    } else {
      selection = range ? range.address : '';
    }

    return (
      <div>
      <div className='full-screen-modal category-title'>
        <ControlLabel>Upload to data.world</ControlLabel>
      </div>
      <Grid className='upload-modal full-screen-modal  '>
      <Row className='center-block'>
        <form onSubmit={this.submit}>
          {excelApiSupported &&
          <FormGroup>
            <ControlLabel>Select the area or sheet to save:</ControlLabel>
            <div className='selection-form' onClick={this.changeSelection}>
              <div className='selection'>
                <label className='radio-button'>
                  <input
                    type='radio'
                    name='selection'
                    value='selection'
                    checked={!selectSheet}
                    readOnly
                  />
                  <span>Selection</span>
                </label>
                <div className='selection-info'>
                  { this.getSelectionText(range) }
                </div>
              </div>
              <div className='selection'>
                <label className='radio-button'>
                  <input
                    type='radio'
                    name='selection'
                    value='sheet'
                    checked={selectSheet}
                    readOnly
                  />
                  <span>Sheet</span>
                </label>
                <div className='selection-info'>
                  {`(${this.getSheetName(range)})`}
                </div>
              </div>
            </div>
          </FormGroup>}
          <FormGroup className='url-group' validationState={validState}>
            <div className='body'>
              <ControlLabel>Dataset or project URL:</ControlLabel>
              <InputGroup>
                <div className='url'>
                  <FormControl
                    value={this.props.url}
                    type='text' />
                  <Button className='browse-button' onClick={() => this.props.showDatasets()}>Browse</Button>
                </div>
              </InputGroup>
              <HelpBlock className='help-block'>
                Copy/paste the URL of a dataset or project, or click "Browse"
              </HelpBlock>
            </div>
          </FormGroup>
          <FormGroup validationState={validState}>
            <ControlLabel>File name</ControlLabel>
            <InputGroup>
              <FormControl
                // disabled={!!options.filename}
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
              // disabled={this.state.isSubmitting || validState !== 'success'}
              bsStyle='primary'>Save file</Button>
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
    </Grid>
    </div>
    )
  }
}

export default UploadModal