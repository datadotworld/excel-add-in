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
  InputGroup,
  MenuItem
} from 'react-bootstrap';
import { getDestination, getExcelColumn, parseData } from '../../util';

import SelectItem from '../SelectItem';

import './ImportData.css';
import RecentImports from '../RecentImports';

export default class UploadModal extends Component {
  state = {
    itemUrl: '',
    querySelected: false,
    tableSelected: false,
    tables: [],
    table: '',
    sheetName: '',
    importing: false,
    showForm: false
  };

  getTables = async (dataset) => {
    if (dataset) {
      try {
        const tables = await this.props.api.getTables(dataset);
        const tableNames = tables.map((table) => ({
          name: table.tableName
        }));
        this.setState({ tables: tableNames, table: tableNames[0] });
      } catch (getTablesError) {
        this.props.setErrorMessage('Unable to retrieve specified selection');
      }
    } else {
      this.props.setErrorMessage('Invalid dataset/project URL');
    }
  };

  getQueries = async (dataset) => {
    if (dataset) {
      try {
        const queries = await this.props.api.getQueries(dataset);
        const queryNames = queries.map((query) => ({
          name: query.name,
          id: query.id
        }));
        this.setState({ tables: queryNames, table: queryNames[0] });
      } catch (getTablesError) {
        this.props.setErrorMessage('Unable to retrieve specified selection');
      }
    } else {
      this.props.setErrorMessage('Invalid dataset/project URL');
    }
  };

  handleUrlChange = (url) => {
    this.setState({
      itemUrl: url,
      tables: [],
      table: '',
      querySelected: false,
      tableSelected: false
    });
  };

  writeData = async (sheetName, data) => {
    const excelColumn = getExcelColumn(data[0].length);
    const range = `A1:${excelColumn}${data.length}`;

    return await this.props.office.writeRangeValues(sheetName, range, data);
  };

  import = async (sheetName, itemUrl, querySelected, table) => {
    this.setState({ importing: true });

    let data;

    if (querySelected) {
      try {
        data = await this.props.api.getQuery(table.id);
      } catch (getQueryError) {
        this.props.setError(getQueryError);
      }
    } else {
      try {
        data = await this.props.api.getTable(
          getDestination(itemUrl),
          table.name
        );
      } catch (getTableError) {
        this.setError(getTableError);
      }
    }

    if (!data.length > 0) {
      this.setErrorMessage('The specified selection does not have any data');
    } else {
      try {
        const parsedData = parseData(data);
        await this.writeData(sheetName, parsedData);
        this.pushToLocalStorage(
          sheetName,
          itemUrl,
          querySelected,
          table,
          new Date()
        );
        this.setState({ showForm: false });
      } catch (writeDataError) {
        if (
          writeDataError.message === "The requested resource doesn't exist."
        ) {
          this.props.setErrorMessage("The specified sheet doesn't exist");
        } else {
          this.props.setError(this.writeDataError);
        }
      }
    }

    this.setState({ importing: false });
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

    const fileIndex = recentImports.findIndex((recentImport) => {
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

    localStorage.removeItem('history');
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

  render() {
    const {
      itemUrl,
      querySelected,
      tableSelected,
      tables,
      table,
      importing,
      showForm,
      sheetName
    } = this.state;

    const recentImports = this.getRecentImports();

    const showImportForm = recentImports.length === 0 || showForm;

    return (
      <div>
        {showImportForm && (
          <div>
            <div className="full-screen-modal category-title">
              <ControlLabel>Import data</ControlLabel>
            </div>
            <div className="import-container">
              <div className="import-from">
                <div className="import-title">From</div>
                <SelectItem
                  itemUrl={this.state.itemUrl}
                  handleChange={this.handleUrlChange}
                  getItems={this.props.getDatasets}
                />
                <div className="import-radio-container">
                  <div className="import-radio-item">
                    <input
                      type="radio"
                      name="selection"
                      value="sheet"
                      checked={tableSelected}
                      readOnly
                      disabled={!itemUrl}
                      onClick={(e) => {
                        this.setState({
                          querySelected: false,
                          tableSelected: true,
                          table: ''
                        });
                        this.getTables(getDestination(itemUrl));
                      }}
                    />
                    <span className="import-radio-label">Table</span>
                  </div>
                  <div className="import-radio-item">
                    <input
                      type="radio"
                      name="selection"
                      value="sheet"
                      checked={querySelected}
                      readOnly
                      disabled={!itemUrl}
                      onClick={(e) => {
                        this.setState({ querySelected: true, table: '' });
                        this.getQueries(getDestination(itemUrl));
                      }}
                    />
                    <span className="import-radio-label">Query</span>
                  </div>
                </div>

                <FormGroup>
                  <DropdownButton
                    id="tables-dropdown"
                    className="projects-ab"
                    title={
                      table
                        ? table.name
                        : `Select ${querySelected ? 'query' : 'table'}`
                    }
                    onSelect={(eventKey) => {
                      this.setState({ table: this.state.tables[eventKey] });
                    }}
                    disabled={!tables.length > 0}
                  >
                    {this.state.tables.map((table, index) => (
                      <MenuItem eventKey={index} key={index}>
                        {table.name}
                      </MenuItem>
                    ))}
                  </DropdownButton>
                </FormGroup>
              </div>
              <div className="import-into">
                <div className="import-title">Into</div>
                <FormGroup>
                  <div>
                    <ControlLabel>Sheet:</ControlLabel>
                    <InputGroup>
                      <div className="select-item-container">
                        <FormControl
                          className="select-item-text-field"
                          placeholder="Enter sheet name"
                          type="text"
                          value={this.state.sheetName}
                          onChange={(e) => {
                            const { value } = e.currentTarget;
                            this.setState({ sheetName: value });
                          }}
                        />
                      </div>
                    </InputGroup>
                    <HelpBlock className="select-item-help-block">
                      Existing data will be discarded and replaced
                    </HelpBlock>
                  </div>
                </FormGroup>
              </div>
              <Button
                type="submit"
                bsStyle="primary"
                className="import-button"
                disabled={!this.formValid() || importing}
                onClick={() =>
                  this.import(sheetName, itemUrl, querySelected, table)
                }
              >
                {importing ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </div>
        )}
        {!showImportForm && (
          <RecentImports
            close={this.closeRecents}
            recentImports={recentImports}
            import={this.import}
            setError={this.props.setError}
          />
        )}
      </div>
    );
  }
}
