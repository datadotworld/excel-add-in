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
import {
  Button,
  ControlLabel,
  DropdownButton,
  FormControl,
  FormGroup,
  HelpBlock,
  Image,
  InputGroup,
  MenuItem,
  Modal
} from 'react-bootstrap';
import { findIndex } from 'lodash';
import {
  getDestination,
  getExcelColumn,
  parseData,
  createSubArrays,
  hasDuplicateName
} from '../../util';

import SelectItem from '../SelectItem';

import './ImportData.css';
import RecentImports from '../RecentImports';

const download = require('../icons/icon-download.svg');

export default class UploadModal extends Component {
  state = {
    itemUrl: '',
    querySelected: false,
    tableSelected: false,
    tables: [],
    tablesLoading: false,
    table: '',
    sheetName: '',
    sheetValidation: {},
    importing: false,
    showForm: false,
    showWarningModal: false,
    show404Modal: false,
    selectedItem: ''
  };

  getTables = async (dataset) => {
    this.setState({ tablesLoading: true });
    if (dataset) {
      try {
        const tables = await this.props.api.getTables(dataset);
        const tableNames = tables.map((table) => {
          return {
            name: table.tableName,
            owner: table.owner,
            dataset: table.dataset
          };
        });
        this.setState({ tables: tableNames });
      } catch (getTablesError) {
        this.props.setErrorMessage('Unable to retrieve specified selection');
      }
    } else {
      this.props.setErrorMessage('Invalid dataset/project URL');
    }
    this.setState({ tablesLoading: false });
  };

  getQueries = async (dataset) => {
    this.setState({ tablesLoading: true });
    if (dataset) {
      try {
        const queries = await this.props.api.getQueries(dataset);
        const queryNames = queries.map((query) => ({
          name: query.name,
          id: query.id
        }));
        this.setState({ tables: queryNames });
      } catch (getTablesError) {
        this.props.setErrorMessage('Unable to retrieve specified selection');
      }
    } else {
      this.props.setErrorMessage('Invalid dataset/project URL');
    }
    this.setState({ tablesLoading: false });
  };

  handleUrlChange = (url) => {
    this.setState({
      itemUrl: url,
      tables: [],
      table: '',
      selectedItem: '',
      querySelected: false,
      tableSelected: false
    });
  };

  writeData = async (sheetName, dataBlocks, blockSize) => {
    try {
      await this.props.office.clearWorksheet(sheetName);

      const lastExcelColumn = getExcelColumn(dataBlocks[0][0].length);

      dataBlocks.forEach(async (block, index) => {
        let range;

        if (block.length === blockSize) {
          range = `A${index * blockSize + 1}:${lastExcelColumn}${(index + 1) *
            blockSize}`;
        } else {
          range = `A${index * blockSize + 1}:${lastExcelColumn}${index *
            blockSize +
            block.length}`;
        }

        try {
          await this.props.office.writeRangeValues(sheetName, range, block);
        } catch (writeValuesError) {
          this.setError(writeValuesError);
        }
      });
    } catch (clearWorksheetError) {
      this.setError(clearWorksheetError);
    }
  };

  writeAndSave = async ({ sheetName, itemUrl, querySelected, table }) => {
    let data;

    if (querySelected) {
      try {
        data = await this.props.api.getQuery(table.id);
      } catch (getQueryError) {
        if (getQueryError.response && getQueryError.response.status) {
          if (
            getQueryError.response.status === 404 ||
            getQueryError.response.status === 400
          ) {
            return this.setState({ show404Modal: true, importing: false });
          }
        }
        this.props.setError(getQueryError);
      }
    } else {
      try {
        data = await this.props.api.getTable(getDestination(itemUrl), table);
      } catch (getTableError) {
        if (getTableError.response && getTableError.response.status) {
          if (
            getTableError.response.status === 404 ||
            getTableError.response.status === 400
          ) {
            return this.setState({ show404Modal: true, importing: false });
          }
        }

        this.props.setError(getTableError);
      }
    }

    if (!data.length > 0) {
      this.props.setErrorMessage(
        'The specified selection does not have any data'
      );
    } else {
      try {
        const parsedData = parseData(data);
        this.writeData(sheetName, createSubArrays(parsedData, 10000), 10000);
        await this.props.office.selectSheet(sheetName);

        this.pushToLocalStorage(
          sheetName,
          itemUrl,
          querySelected,
          table,
          new Date()
        );

        // Reset form after successful import
        this.setState({
          showForm: false,
          itemUrl: '',
          querySelected: false,
          tableSelected: false,
          tables: [],
          table: '',
          sheetName: ''
        });
      } catch (selectSheetError) {
        this.props.setErrorMessage(selectSheetError);
      }
    }

    this.setState({ importing: false });
  };

  import = async (sheetName, itemUrl, querySelected, table) => {
    this.setState({
      importing: true,
      importArgs: { sheetName, itemUrl, querySelected, table }
    });

    const sheetExists = await this.props.office.sheetExists(sheetName);

    if (!sheetExists) {
      try {
        await this.props.office.createWorksheet(sheetName);
        await this.writeAndSave({ sheetName, itemUrl, querySelected, table });
      } catch (createSheetError) {
        this.props.setErrorMessage(createSheetError.message);
        this.setState({ importing: false });
        return;
      }
    } else {
      this.setState({
        showWarningModal: true
      });
    }
  };

  cancelshowWarningModal = () => {
    this.setState({ showWarningModal: false, importing: false });
  };

  pushToLocalStorage = async (sheetName, itemUrl, isQuery, table, date) => {
    const recents = localStorage.getItem('history')
      ? JSON.parse(localStorage.getItem('history'))
      : {};
    const recentImports = recents.recentImports || [];
    const newImport = {
      sheetName,
      itemUrl,
      isQuery,
      table,
      userId: this.props.user.id,
      workbook: this.props.workbookId,
      date
    };

    const fileIndex = findIndex(recentImports, (recentImport) => {
      if (
        recentImport.table.name === table.name &&
        recentImport.sheetName === sheetName
      ) {
        if (
          recentImport.userId === this.props.user.id &&
          recentImport.workbook === this.props.workbookId
        ) {
          return true;
        }
      }

      return false;
    });

    if (fileIndex === -1) {
      recentImports.push(newImport);
    } else {
      recentImports[fileIndex] = newImport;
    }

    recents.recentImports = recentImports;

    localStorage.setItem('history', JSON.stringify(recents));
  };

  closeRecents = () => {
    this.setState({ showForm: true });
  };

  getRecentImports = () => {
    const { recentImports } = localStorage.getItem('history')
      ? JSON.parse(localStorage.getItem('history'))
      : {};
    let matchedFiles = [];

    if (recentImports) {
      const allImports = recentImports || [];
      matchedFiles = allImports
        .filter((file) => {
          return (
            this.props.user &&
            this.props.user.id === file.userId &&
            file.workbook === this.props.workbookId
          );
        })
        .sort((a, b) => {
          if (a.date < b.date) {
            return 1;
          }
          if (a.date > b.date) {
            return -1;
          }

          return 0;
        });
    }

    return matchedFiles;
  };

  formValid = () => {
    const { itemUrl, sheetName, table } = this.state;

    return !!itemUrl && !!sheetName && !!table;
  };

  validateSheetName = (sheetName) => {
    const invalidChars = ['\\', '/', '*', '?', ':', '[', ']'];

    const hasInvalidCharacter = (char) => sheetName.indexOf(char) > -1;

    if (invalidChars.some(hasInvalidCharacter)) {
      return {
        valid: false,
        erroMessage: `Sheet name cannot contain: ${invalidChars.join(', ')}`
      };
    }

    if (sheetName.length > 31) {
      return {
        valid: false,
        erroMessage: `Sheet name cannot contain more than 31 characters`
      };
    }

    return { valid: true };
  };

  handleSheetNameChange = (e) => {
    const { value } = e.currentTarget;
    const validationState = this.validateSheetName(value);

    this.setState({ sheetName: value, sheetValidation: validationState });
  };

  formValid = () => {
    const { sheetValidation, table } = this.state;
    return sheetValidation.valid && table;
  };

  render() {
    const {
      itemUrl,
      querySelected,
      tableSelected,
      tables,
      tablesLoading,
      table,
      importing,
      showForm,
      sheetName,
      sheetValidation,
      showWarningModal,
      show404Modal,
      importArgs,
      selectedItem
    } = this.state;

    const recentImports = this.getRecentImports();

    const showImportForm = recentImports.length === 0 || showForm;

    let dropdownText = '';

    if (selectedItem) {
      dropdownText = selectedItem;
    } else if (tablesLoading) {
      dropdownText = 'Loading...';
    } else if (querySelected) {
      dropdownText = tables.length > 0 ? 'Select query' : 'No queries found';
    } else if (tableSelected) {
      dropdownText = tables.length > 0 ? 'Select table' : 'No tables found';
    }

    return (
      <div>
        {showImportForm && (
          <div>
            <div className="import-header">
              <ControlLabel className="import-header-text">
                Import data
              </ControlLabel>
            </div>
            <div className="import-container">
              <div className="import-from">
                <SelectItem
                  itemUrl={this.state.itemUrl}
                  handleChange={this.handleUrlChange}
                  getItems={this.props.getDatasets}
                  title="Import from:"
                  placeholder="Insert Dataset or Project URL"
                />
                <div className="import-radio-container">
                  <div className="import-sub-title">Source:</div>
                  <div className="import-radio-item">
                    <input
                      type="radio"
                      checked={tableSelected}
                      readOnly
                      disabled={!itemUrl}
                      onClick={(e) => {
                        this.setState({
                          querySelected: false,
                          tableSelected: true,
                          table: '',
                          tables: []
                        });
                        this.getTables(getDestination(itemUrl));
                      }}
                    />
                    <span className="import-radio-label">Table</span>
                  </div>
                  <div className="import-radio-item">
                    <input
                      type="radio"
                      checked={querySelected}
                      readOnly
                      disabled={!itemUrl}
                      onClick={(e) => {
                        this.setState({
                          querySelected: true,
                          tableSelected: false,
                          table: '',
                          tables: []
                        });
                        this.getQueries(getDestination(itemUrl));
                      }}
                    />
                    <span className="import-radio-label">Query</span>
                  </div>
                </div>

                {dropdownText && (
                  <FormGroup>
                    <DropdownButton
                      id="tables-dropdown"
                      className="import-dropdown"
                      title={dropdownText}
                      onSelect={(eventKey) => {
                        this.setState({ table: this.state.tables[eventKey] });
                      }}
                      disabled={!tables.length > 0}
                    >
                      {this.state.tables.map((table, index) => {
                        const duplicateName = hasDuplicateName(
                          { name: table.name, dataset: table.dataset },
                          this.state.tables
                        );

                        const itemText = duplicateName
                          ? `${table.name} (${table.owner}.${table.dataset})`
                          : table.name;

                        return (
                          <MenuItem
                            eventKey={index}
                            key={index}
                            name={itemText}
                            onClick={(event) => {
                              this.setState({
                                selectedItem: event.currentTarget.name
                              });
                            }}
                          >
                            {itemText}
                          </MenuItem>
                        );
                      })}
                    </DropdownButton>
                  </FormGroup>
                )}
              </div>
              <div className="import-into">
                <div className="import-sub-title">Save data to:</div>
                <InputGroup>
                  <FormControl
                    className="import-into-field"
                    placeholder="Insert existing or new sheet name"
                    type="text"
                    value={this.state.sheetName}
                    onChange={this.handleSheetNameChange}
                  />
                  {!sheetValidation.erroMessage && (
                    <HelpBlock className="import-into-help">
                      Existing data will be discarded and replaced
                    </HelpBlock>
                  )}
                  {sheetValidation.erroMessage && (
                    <HelpBlock className="import-into-help-error">
                      {sheetValidation.erroMessage}
                    </HelpBlock>
                  )}
                </InputGroup>
              </div>
              <div className="import-into-buttons">
                {recentImports.length > 0 && (
                  <Button
                    className="import-button-cancel"
                    onClick={() =>
                      this.setState({
                        showForm: false,
                        itemUrl: '',
                        tables: [],
                        table: '',
                        selectedItem: '',
                        querySelected: false,
                        tableSelected: false,
                        sheetName: ''
                      })
                    }
                    disabled={importing}
                  >
                    Cancel
                  </Button>
                )}

                <Button
                  type="submit"
                  bsStyle="primary"
                  className={
                    recentImports.length > 0
                      ? 'import-button-import'
                      : 'import-button-import-full'
                  }
                  onClick={() =>
                    this.import(sheetName, itemUrl, querySelected, table)
                  }
                  disabled={!this.formValid() || importing}
                >
                  {!importing && (
                    <Image className="icon-download" src={download} />
                  )}
                  {importing ? 'Importing...' : 'Import'}
                </Button>
              </div>
            </div>
          </div>
        )}
        {!showImportForm && (
          <RecentImports
            close={this.closeRecents}
            recentImports={recentImports}
            import={this.import}
            setError={this.props.setError}
            importing={importing}
          />
        )}
        {showWarningModal && (
          <div className="static-modal">
            <Modal.Dialog className="import-warning-modal">
              <Modal.Header>
                <Modal.Title>Replace sheet data?</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Existing data will be discarded and replaced.
              </Modal.Body>
              <Modal.Footer className="import-warning-modal-footer">
                <Button bsSize="small" onClick={this.cancelshowWarningModal}>
                  Cancel
                </Button>
                <Button
                  bsStyle="primary"
                  bsSize="small"
                  onClick={() => {
                    this.setState({ showWarningModal: false });
                    this.writeAndSave(this.state.importArgs);
                  }}
                >
                  Continue
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
        )}
        {show404Modal && (
          <div className="static-modal">
            <Modal.Dialog className="import-warning-modal">
              <Modal.Header>
                <Modal.Title>Not found</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {`This ${
                  importArgs.querySelected ? 'query' : 'table'
                } can no longer be found`}
              </Modal.Body>
              <Modal.Footer className="import-warning-modal-footer">
                <Button
                  bsSize="small"
                  onClick={() => {
                    this.setState({ show404Modal: false });
                  }}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
        )}
      </div>
    );
  }
}
