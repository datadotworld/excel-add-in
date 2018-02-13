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
import queryString from 'query-string'

import { Alert } from 'react-bootstrap';
import find from 'array.prototype.find';

import './App.css';
import './static/css/dw-bootstrap.min.css';

import CreateDatasetModal from './components/CreateDatasetModal';
import CSVWarningModal from './components/CSVWarningModal';
import AddDataModal from './components/AddDataModal';
import WelcomePage from './components/WelcomePage';
import BindingsPage from './components/BindingsPage';
import DatasetsView from './components/DatasetsView';
import LoadingAnimation from './components/LoadingAnimation';
import LoginHeader from './components/LoginHeader';
import Insights from './components/Insights';
import ImportData from './components/ImportData';

import OfficeConnector from './OfficeConnector';
import DataDotWorldApi from './DataDotWorldApi';
import analytics from './analytics';
import { isSheetBinding, getSheetName } from './util';
import { MAX_COLUMNS, MAX_COLUMNS_ERROR, SHEET_RANGE } from './constants';

const DW_API_TOKEN = 'DW_API_TOKEN';
const DW_PREFERENCES = 'DW_PREFERENCES';
const DISMISSALS_CSV_WARNING = 'CSV_DISMISSAL_WARNING';
const { localStorage } = window;

class App extends Component {

  constructor () {
    super();

    find.shim();

    this.createBinding = this.createBinding.bind(this);
    this.getDatasets = this.getDatasets.bind(this);
    this.linkDataset = this.linkDataset.bind(this);
    this.removeBinding = this.removeBinding.bind(this);
    this.unlinkDataset = this.unlinkDataset.bind(this);
    this.createDataset = this.createDataset.bind(this);
    this.linkNewDataset = this.linkNewDataset.bind(this);
    this.refreshLinkedDataset = this.refreshLinkedDataset.bind(this);
    this.updateBinding = this.updateBinding.bind(this);
    this.sync = this.sync.bind(this);
    this.initializeDatasets = this.initializeDatasets.bind(this);
    this.initializeInsights = this.initializeInsights.bind(this);

    this.parsedQueryString = queryString.parse(window.location.search);

    let token;
    if (this.parsedQueryString.token) {
      token = this.parsedQueryString.token;
      localStorage.setItem(DW_API_TOKEN, token);
      analytics.identify(token);
    } else {
      token = localStorage.getItem(DW_API_TOKEN);
    }

    let preferences;
    try  {
      preferences = JSON.parse(localStorage.getItem(DW_PREFERENCES));
    } catch (e) {
      // ignore error
    } finally {
      if (! preferences) {
        preferences = { dismissals: [] };
      }
    }

    // To be used for rendering the respective pages and header styling
    const page = window.location.pathname.substr(1);

    this.state = {
      token,
      preferences,
      bindings: [],
      datasets: [],
      loadingDatasets: false,
      loggedIn: !!token,
      officeInitialized: false,
      syncStatus: {},
      page,
      charts: [],
      projects: []
    };

    if (token) {
      this.api = new DataDotWorldApi(token);
      this.getUser();
    }

    this.initializeOffice();
  }

  async initializeOffice() {
    const { page } = this.state;
    try {
      this.office = new OfficeConnector();
      await this.office.initialize();

      if (page === 'insights') {
        this.initializeInsights();
      } else if(page === 'import') {
        return;
      } else {
        this.initializeDatasets();
      }
    } catch (error) {
      this.setState({
        error: {
          error,
          message: 'There was an error initializing the Office connector, please try again.'
        }
      });
    }
  }

  async initializeDatasets() {
    try {
      const settings = this.office.getSettings();
      let syncStatus = settings.syncStatus;
      let dataset = settings.dataset;
      if (! dataset && this.state.loggedIn) {
        this.getDatasets();
      } else if (this.state.loggedIn) {
        dataset = await this.refreshLinkedDataset(dataset);
      }
      if (! syncStatus) {
        syncStatus = {};
      }

      const bindings = await this.office.getBindings();
      bindings.forEach((binding) => {
        if (!syncStatus[binding.id]) {
          syncStatus[binding.id] = {
            synced: false,
            changes: 1,
            lastSync: null
          };
        }
      });

      this.setState({
        bindings,
        dataset,
        syncStatus,
        excelApiSupported: this.office.isExcelApiSupported(),
        officeInitialized: true,
        csvMode: this.office.isCSV()
      });

      bindings.forEach(this.listenForChangesToBinding);
    } catch(error) {
      this.setState({
        error: {
          error,
          message: 'There was an error initializing the datasets page, please try again.'
        }
      });
    }
  }

  async initializeInsights() {
    try {
      if (this.state.loggedIn) {
        // Logged in user's projects
        const projects = await this.api.getProjects();

        // All the charts in the workbook
        const charts = await this.getCharts();
        this.setState({ charts, projects, officeInitialized: true });
      }
    } catch(error) {
      this.setState({
        error: {
          error,
          message: 'There was an error initializing the Insights page, please try again.'
        }
      });
    }
  }

  logout = () => {
    localStorage.setItem(DW_API_TOKEN, '');
    this.setState({token: null, loggedIn: false, user: null});
    window.location = `https://data.world/embed/logout?next=${encodeURIComponent('https://excel.data.world')}`;
  }

  listenForChangesToBinding = (binding) => {
    this.office.listenForChanges(binding, (event) => {
      const { syncStatus } = this.state;
      syncStatus[binding.id].changes += 1;
      syncStatus[binding.id].synced = false;

      this.office.setSyncStatus(syncStatus);
      this.setState({ syncStatus });
    });
  }

  async createBinding (selection) {
    try {
      const namedItem = await this.office.createSelectionRange(selection.sheetId, selection.range)
      const binding = await this.office.createBinding(selection.name, namedItem);
      if (binding.columnCount > MAX_COLUMNS) {
        await this.office.removeBinding(binding);
        throw new Error(MAX_COLUMNS_ERROR);
      }

      await this.office.getBindingRange(binding);

      const syncStatus = this.state.syncStatus;
      syncStatus[binding.id] = {
        synced: false,
        lastSync: null,
        changes: 1
      };

      this.state.bindings.push(binding);
      this.listenForChangesToBinding(binding);
      this.setState({
        syncStatus,
        bindings: this.state.bindings
      });

      return binding;
    } catch (error) {
      this.setState({error});
    }
  }

  async removeBinding (binding) {
    try {
      await this.office.removeBinding(binding);
      const { bindings } = this.state;
      if (bindings.indexOf(binding) > -1) {
        bindings.splice(bindings.indexOf(binding), 1);
        this.setState({ bindings });
      }
    } catch (error) {
      this.setState({error});
    }
  }

  async getDatasets () {
    try {
      this.setState({loadingDatasets: true});
      const datasets = await this.api.getDatasets();
      this.setState({
        datasets,
        loadingDatasets: false
      });
    } catch (error) {
      this.setState({
        error,
        loadingDatasets: false
      });
    }
  }

  handleDatasetFetchError(error) {
    if (error.response && error.response.status === 401) {
      this.logout();
    } else if (error.response && error.response.status === 404) {
      this.unlinkDataset();
      this.setState({error: 'Dataset not found'})
    } else {
      this.setState({error});
    }
  }

  async refreshLinkedDataset (datasetToRefresh = this.state.dataset) {
    try {
      const dataset = await this.api.getDataset(`${datasetToRefresh.owner}/${datasetToRefresh.id}`);
      this.office.setDataset(dataset);
      this.setState({ dataset });

      return dataset;
    } catch (error) {
      this.handleDatasetFetchError(error);
    }
  }

  async linkNewDataset (datasetUrl) {
    try {
      const dataset = await this.api.getDataset(datasetUrl);
      return await this.linkDataset(dataset);
    } catch (error) {
      this.handleDatasetFetchError(error);
    }
  }

  async linkDataset (dataset) {
    try  {
      const freshDataset = await this.api.getDataset(`${dataset.owner}/${dataset.id}`);
      this.setState({ dataset: freshDataset });
      if (this.state.csvMode && !this.hasBeenDismissed(DISMISSALS_CSV_WARNING)) {
        this.setState({showCSVWarning: true});
      }
      return await this.office.setDataset(freshDataset);
    } catch (error) {
      this.handleDatasetFetchError(error);
    }
  }

  async unlinkDataset () {
    try {
      await this.office.setDataset(null);
      await this.office.setSyncStatus({});
      this.state.bindings.forEach((binding) => {
        this.office.removeBinding(binding);
      });
      this.getDatasets();
      this.setState({
        dataset: null,
        bindings: [],
        syncStatus: {}
      });
    } catch (error) {
      this.setState({error});
    }
  }

  /**
   * Gets the user from the data.world API and sets it on the state
   */
  async getUser () {
    try {
      const user = await this.api.getUser();
      this.setState({user});
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.logout();
      }
    }
  }

  /**
   * Removes and then recreates a binding with the active selection.
   * There is not currently a way to update the range for an existing binding
   * in the office API.
   */
  async updateBinding (binding, selection) {
    try {
      await this.removeBinding(binding);
      return this.createBinding(selection);
    } catch (error) {
      this.setState({ error });
    }
  }

  /**
   * Highlights the address provided in the excel document
   */
  select = (address) => {
    this.office.select(address);
  }

  dismissError = () => {
    this.setState({ error: null });
  }

  /**
   * Removes blank rows and columns around the data
   */
  trimFile = (grid) => {
    const numberOfRows = grid.length;
    const numberOfColumns = grid[0].length;

    // Rows and columns where the data starts and ends
    const paramaters = {
      firstRow: numberOfRows,
      lastRow: 0,
      firstColumn: numberOfColumns,
      lastColumn: 0
    }

    for (let row = 0; row < numberOfRows; row++) {
      for (let column = 0; column < numberOfColumns; column++) {

        // If current cell contains data
        if (grid[row][column]) {
          if (row < paramaters.firstRow) {
            paramaters.firstRow = row
          }
          if (row > paramaters.lastRow) {
            paramaters.lastRow = row
          }

          if (column < paramaters.firstColumn) {
            paramaters.firstColumn = column
          }

          if (column > paramaters.lastColumn) {
            paramaters.lastColumn = column
          }
        }
      }
    }

    // Remove blank rows and columns
    const trimmedRows = grid.slice(paramaters.firstRow, paramaters.lastRow + 1);
    const trimmedColumns = trimmedRows.map(row => {
      return row.slice(paramaters.firstColumn, paramaters.lastColumn + 1);
    })

    const result = trimmedColumns.length > 0 ? trimmedColumns : [['']]
    return result;
  }

  getExcelBindings() {
    return new Promise((resolve, reject) => {
      this.office.getBindings().then((bindings) => {
        resolve(bindings);
      })
      .catch((error) => {
        reject(error);
      })
    })
  }

  /**
   * Replaces all the bindings stored in the state with those stored in Excel
   * while ensuring sheet bindings remain bound to the sheet
   */
  updateBindings() {
    return new Promise((resolve, reject) => {
      this.getExcelBindings().then((excelBindings) => {
        // Get all the current sheet bindings from state
        const sheetBindings = this.state.bindings.filter((binding) => {
          return isSheetBinding(binding);
        });
        const sheetBindingIds = sheetBindings.map((binding) => binding.id);

        // Remove all the current state bindings for replacement
        this.setState({bindings: []});
        const promises = [];

        excelBindings.forEach((binding) => {
          // Find sheet bindings whose binding range has changed in Excel but not in the state
          if (sheetBindingIds.indexOf(binding.id) > -1 && !isSheetBinding(binding)) {
            // Rebind changed bindings to the sheet
            const promise = new Promise((resolve, reject) => {
              // Sheet ID unavailable, use the sheet name instead
              const sheet = getSheetName(binding);
              // Extract file name from the binding id
              const name = binding.id.replace('dw::', '');
              const range = SHEET_RANGE;

              this.updateBinding(binding, {sheetId: sheet, range, name})
                .then(resolve)
                .catch(reject);
            });
            promises.push(promise);
          } else {
            // Simply add all other bindings to the state
            const stateBindings = this.state.bindings;
            stateBindings.push(binding)
            this.setState({bindings: stateBindings});
          }
        });
        Promise.all(promises)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  /**
   * Saves bindings to their associated files on data.world.  If a binding
   * is provided, then only that binding is saved to data.world.
   */
  async sync(binding) {
    try {
      this.setState({syncing: true});
      // Actions such as deleting a column and renaming a sheet cause the value of Excel's bindings
      // to change, bindings must therefore be updated before a sync is attempted
      await this.updateBindings();
      return new Promise((resolve, reject) => {
        const bindings = binding ? [binding] : this.state.bindings;
        const promises = [];
        bindings.forEach((binding) => {
          const promise = new Promise((resolve, reject) => {
            this.office.getData(binding).then((data) => {
              const trimmedData = this.trimFile(data);
              return this.api.uploadFile({
                data: trimmedData,
                dataset: this.state.dataset,
                filename: binding.id.replace('dw::', '')
              });
            }).then(() => {
              const syncStatus = this.state.syncStatus;
              syncStatus[binding.id].synced = true;
              syncStatus[binding.id].changes = 0;
              syncStatus[binding.id].lastSync = new Date();
              this.office.setSyncStatus(syncStatus);
              this.setState({ syncStatus });
              resolve();
            }).catch((error) => {
              this.setState({error});
              this.setState({syncing: false});
              reject();
            });
          });

          promises.push(promise);
        });

        Promise.all(promises).then(() => {
          this.setState({syncing: false});
          resolve();
        }).catch((error) => {
          this.setState({error});
          this.setState({syncing: false});
          reject();
        });
      });
    } catch(error) {
      this.setState({syncing: false, error});
    }
  }

  showCreateDataset = () => {
    this.setState({showCreateDataset: true});
  }

  showAddData = (filename, binding) => {

    if (binding) {
      // Select non sheet binding range
      if (!isSheetBinding(binding)) {
        this.office.select(binding.rangeAddress);
      } else {
        // Display the bound sheet
        const sheet = getSheetName(binding);
        this.office.activateSheet(sheet);
      }
    }

    // Listen for changes to the selected range
    this.office.listenForSelectionChanges((currentSelectedRange) => {
      this.setState({currentSelectedRange});
    });

    // But also grab the current selection
    this.office.getCurrentlySelectedRange().then((currentSelectedRange) => {
      this.setState({currentSelectedRange});
    });

    this.setState({
      showAddDataModal: true,
      addDataModalOptions: {binding, filename}
    });
  }

  closeAddData = () => {
    this.office.stopListeningForSelectionChanges();
    this.setState({showAddDataModal: false, addDataModalOptions: {}});
  }

  dismissCSVWarning = (options) => {
    if (options.dismissWarning) {
      this.state.preferences.dismissals.push(DISMISSALS_CSV_WARNING);
      localStorage.setItem(DW_PREFERENCES, JSON.stringify(this.state.preferences));
    }

    this.setState({
      showCSVWarning: false,
      preferences: this.state.preferences
    });
  }

  async createDataset (dataset) {
    return await this.api.createDataset(this.state.user.id, dataset);
  }

  createProject = (project) => {
    return this.api.createProject(this.state.user.id, project);
  }

  doesFileExist = (filename) => {
    let fileExists = false;
    this.state.dataset.files.forEach((file) => {
      if (file.name === filename) {
        fileExists = true;
      }
    });
    return fileExists;
  }

  hasBeenDismissed = (key) => {
    return this.state.preferences.dismissals.find((dismissal) => {
      return dismissal === key;
    });
  }

  getCharts = () => {
    return new Promise((resolve, reject) => {
      this.office.getWorksheets().then(worksheets => {
        const promises = worksheets.map(worksheet => {
          // Returns an array of charts in the worksheet
          return this.office.getCharts(worksheet.id);
        })

        Promise.all(promises).then((allCharts) => {
          // Some worksheets may not contain charts
          const charts = allCharts.filter(chart => {
            return chart.length > 0;
          });

          // charts is an array of arrays, flatten before resolving
          resolve([].concat.apply([], charts));
        }).catch(reject);
      });
    });
  }

  uploadChart = (imageString, options) => {
    return this.api.uploadChart(imageString, options);
  }
  
  render () {
    const {
      addDataModalOptions,
      bindings,
      currentSelectedRange,
      dataset,
      datasets,
      error,
      excelApiSupported,
      loadingDatasets,
      loggedIn,
      officeInitialized,
      showAddDataModal,
      showCreateDataset,
      syncing,
      syncStatus,
      user,
      page,
      charts,
      projects
    } = this.state;

    let errorMessage = error;
    if (error && typeof error !== 'string') {
      errorMessage = error.message;
    }

    const showStartPage = officeInitialized && !loggedIn;
    const modalViewOpened = showAddDataModal || showCreateDataset;

    const insights = page === 'insights';
    const importData = page === 'import'

    return (
      <div>
        {error && <Alert bsStyle='warning' onDismiss={this.dismissError}>{errorMessage}</Alert>}
        {!officeInitialized && !error && <LoadingAnimation />}
        {loggedIn && <LoginHeader user={user} logout={this.logout} page={page} />}
        {showStartPage && <WelcomePage dataset={dataset} />}
        {!showStartPage && !modalViewOpened && dataset && !insights && <BindingsPage
          bindings={bindings}
          dataset={dataset}
          createBinding={this.createBinding}
          removeBinding={this.removeBinding}
          unlinkDataset={this.unlinkDataset}
          showAddData={this.showAddData}
          select={this.select}
          sync={this.sync}
          syncing={syncing}
          syncStatus={syncStatus}
        />}

        {
          !showStartPage &&
          !dataset &&
          !showCreateDataset &&
          !insights && 
          !importData && <DatasetsView
            datasets={datasets}
            createDataset={this.showCreateDataset}
            linkDataset={this.linkDataset}
            loadingDatasets={loadingDatasets}
          />
        }

        {showCreateDataset && <CreateDatasetModal 
          user={user}
          linkNewDataset={this.linkNewDataset}
          createDataset={this.createDataset} close={() => this.setState({showCreateDataset: false})} 
        />}

        {showAddDataModal && <AddDataModal 
          sync={this.sync}
          excelApiSupported={excelApiSupported}
          range={currentSelectedRange}
          close={this.closeAddData}
          options={addDataModalOptions}
          createBinding={this.createBinding}
          refreshLinkedDataset={this.refreshLinkedDataset}
          updateBinding={this.updateBinding}
          doesFileExist={this.doesFileExist}
        />}

        {!showStartPage && insights && <Insights
          getImageAndTitle={this.office.getImageAndTitle}
          charts={charts}
          user={user}
          officeInitialized={officeInitialized}
          projects={projects}
          createProject={this.createProject}
          uploadChart={this.uploadChart}
        />}

        {!showStartPage && importData && <ImportData />}
        <CSVWarningModal show={this.state.showCSVWarning} successHandler={this.dismissCSVWarning} />
      </div>
    );
  }
}

export default App;
