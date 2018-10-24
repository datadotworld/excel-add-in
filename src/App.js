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
import queryString from 'query-string';
import { flatten } from 'lodash';

import { Alert } from 'react-bootstrap';
import find from 'array.prototype.find';

import './App.css';
import './static/css/dw-bootstrap.min.css';

import CreateDatasetModal from './components/CreateDatasetModal';
import CSVWarningModal from './components/CSVWarningModal';
import WelcomePage from './components/WelcomePage';
import DatasetsView from './components/DatasetsView';
import LoadingAnimation from './components/LoadingAnimation';
import LoginHeader from './components/LoginHeader';
import Insights from './components/Insights';
import ImportData from './components/ImportData';
import NotOfficeView from './components/NotOfficeView';

import OfficeConnector from './OfficeConnector';
import DataDotWorldApi from './DataDotWorldApi';
import analytics from './analytics';
import { isSheetBinding, getSheetName } from './util';
import { MAX_COLUMNS, MAX_COLUMNS_ERROR, SHEET_RANGE } from './constants';
import UploadModal from './components/UploadModal';
import RecentUploads from './components/RecentUploads';
import migrations from './migrations';

const DW_API_TOKEN = 'DW_API_TOKEN';
const DW_APP_VERSION = 'DW_APP_VERSION';
const DW_PREFERENCES = 'DW_PREFERENCES';
const DISMISSALS_CSV_WARNING = 'CSV_DISMISSAL_WARNING';
const INSIGHTS_ROUTE = 'insights';
const IMPORT_ROUTE = 'import';
const { localStorage } = window;

export default class App extends Component {
  constructor() {
    super();
    find.shim();

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
    try {
      preferences = JSON.parse(localStorage.getItem(DW_PREFERENCES));
    } catch (e) {
      // ignore error
    } finally {
      if (!preferences) {
        preferences = { dismissals: [] };
      }
    }

    // To be used for rendering the respective pages and header styling
    const page =
      this.parsedQueryString.page || window.location.pathname.substr(1);

    // To be used for rendering the appropriate landing page
    const version = this.parsedQueryString.v;
    if (version) {
      // Extra version information is attached on Excel desktop
      // e.g. "1.1.0.0?_host_Info=Excel$Mac$16.01$en-US"
      localStorage.setItem(DW_APP_VERSION, version.split('?')[0]);
    }

    // To be used to display NotOfficeView
    let insideOffice;
    // window.OfficeHelpers will be undefined when running tests
    if (window.OfficeHelpers) {
      if (window.OfficeHelpers.Utilities.host === 'EXCEL') {
        insideOffice = true;
      } else {
        insideOffice = false;
      }
    } else {
      insideOffice = true;
    }

    this.state = {
      error: null,
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
      projects: [],
      version: localStorage.getItem(DW_APP_VERSION, version),
      insideOffice,
      showDatasets: false,
      url: '',
      forceShowUpload: false,
      loadingSync: false,
      selectSheet: false
    };

    if (token) {
      this.api = new DataDotWorldApi(token);
      this.getUser();
    }

    this.initializeOffice().then(() => {
      this.getSelectionRange();
    });
  }

  getSelectionRange = () => {
    this.office.getCurrentlySelectedRange().then((currentSelectedRange) => {
      this.setState({ currentSelectedRange });
    });

    this.office.listenForSelectionChanges((currentSelectedRange) => {
      this.setState({ currentSelectedRange });
    });
  };

  changeSelection = (event) => {
    const { value } = event.target;
    if (value === 'selection') {
      this.setState({ selectSheet: false });
    } else if (value === 'sheet') {
      this.setState({ selectSheet: true });
    }
  };

  initializeOffice = async () => {
    const { page } = this.state;
    try {
      this.office = new OfficeConnector();
      await this.office.initialize();
      if (page === INSIGHTS_ROUTE) {
        this.initializeInsights();
      } else if (page === IMPORT_ROUTE) {
        return this.setState({ officeInitialized: true });
      } else {
        this.initializeDatasets();
      }
      this.getWorkbookId();
    } catch (error) {
      this.setError(error);
    }
  };

  initializeDatasets = async () => {
    try {
      const settings = this.office.getSettings();
      const { pushToLocalStorage, office } = this;
      let { syncStatus, dataset, nextMigrationIndex } = settings;

      if (!this.state.loggedIn) {
        return this.setState({ officeInitialized: true, outsideOffice: false });
      }
      if (this.state.loggedIn) {
        this.getDatasets();
      } else if (this.state.loggedIn) {
        dataset = await this.refreshLinkedDataset(dataset);
      }
      if (!syncStatus) {
        syncStatus = {};
      }

      try {
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

        if (dataset) {
          migrations.slice(0).forEach((migrationFn, idx) => {
            try {
              migrationFn({
                bindings,
                pushToLocalStorage,
                getSheetName,
                dataset
              });
              office.setNextMigrationIndex(nextMigrationIndex + idx + 1);
            } catch (migrationError) {
              this.setError(migrationError);
            }
          });
        }

        this.setState({
          bindings,
          dataset,
          syncStatus,
          excelApiSupported: this.office.isExcelApiSupported(),
          officeInitialized: true,
          outsideOffice: false,
          csvMode: this.office.isCSV()
        });

        bindings.forEach(this.listenForChangesToBinding);
      } catch (getBindingsError) {
        this.setError(getBindingsError);
      }
    } catch (refreshDatasetsError) {
      this.setError(refreshDatasetsError);
    }
  };

  initializeInsights = async () => {
    if (this.state.loggedIn) {
      try {
        // Logged in user's projects
        const projects = await this.api.getProjects();

        try {
          // All the charts in the workbook
          const charts = await this.getCharts();
          this.setState({ charts, projects, officeInitialized: true });
        } catch (getChartsError) {
          this.setError(getChartsError);
        }
      } catch (getProjectsError) {
        this.setError(getProjectsError);
      }
    } else {
      this.setState({ officeInitialized: true });
    }
  };

  logout = () => {
    // To aid in showing the correct welcome screen after logging out
    const version = localStorage.getItem(DW_APP_VERSION);

    localStorage.setItem(DW_APP_VERSION, '');
    localStorage.setItem(DW_API_TOKEN, '');
    this.setState({ token: null, loggedIn: false, user: null });
    window.location = `https://data.world/embed/logout?next=${encodeURIComponent(
      `https://excel.data.world?v=${version}`
    )}`;
  };

  listenForChangesToBinding = (binding) => {
    this.office.listenForChanges(binding, (event) => {
      const { syncStatus } = this.state;
      syncStatus[binding.id].changes += 1;
      syncStatus[binding.id].synced = false;

      this.office.setSyncStatus(syncStatus);
      this.setState({ syncStatus });
    });
  };

  createBinding = async (selection) => {
    try {
      const namedItem = await this.office.createSelectionRange(
        selection.sheetId,
        selection.range
      );

      try {
        const binding = await this.office.createBinding(
          selection.name,
          namedItem
        );

        if (binding.columnCount > MAX_COLUMNS) {
          try {
            await this.office.removeBinding(binding);
            throw new Error(MAX_COLUMNS_ERROR);
          } catch (removeBindingError) {
            this.setError(removeBindingError);
          }
        }

        try {
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
        } catch (getBindingError) {
          this.setError(getBindingError);
        }
      } catch (bindingError) {
        this.setError(bindingError);
      }
    } catch (selectionError) {
      this.setError(selectionError);
    }
  };

  removeBinding = async (binding) => {
    try {
      await this.office.removeBinding(binding);
      const { bindings } = this.state;
      if (bindings.indexOf(binding) > -1) {
        bindings.splice(bindings.indexOf(binding), 1);
        this.setState({ bindings });
      }
    } catch (removeBindingError) {
      this.setError(removeBindingError);
    }
  };

  getDatasets = async () => {
    try {
      this.setState({ loadingDatasets: true });
      const datasets = await this.api.getDatasets();
      this.setState({
        datasets,
        loadingDatasets: false
      });
    } catch (getDatasetsError) {
      this.setState({
        error: {
          error: getDatasetsError,
          message: 'There was an error fetching the datasets, please try again.'
        },
        loadingDatasets: false
      });
    }
  };

  handleDatasetFetchError = (error) => {
    if (error.response && error.response.status === 401) {
      this.logout();
    } else if (error.response && error.response.status === 404) {
      this.unlinkDataset();
      this.setError(new Error('Dataset not found'));
    } else {
      this.setError(error);
    }
  };

  refreshLinkedDataset = async (datasetToRefresh = this.state.dataset) => {
    if (datasetToRefresh) {
      try {
        const dataset = await this.api.getDataset(
          `${datasetToRefresh.owner}/${datasetToRefresh.id}`
        );
        this.office.setDataset(dataset);
        this.setState({ dataset });

        return dataset;
      } catch (error) {
        this.handleDatasetFetchError(error);
      }
    }
  };

  linkDataset = async (dataset) => {
    this.setState({ url: dataset, showDatasets: false });
    const regexMatch = /https:\/\/data\.world\/(.*)\/(.*)/;
    const match = dataset.match(regexMatch);
    try {
      const freshDataset = await this.api.getDataset(`${match[1]}/${match[2]}`);
      this.setState({ dataset: freshDataset });
      if (
        this.state.csvMode &&
        !this.hasBeenDismissed(DISMISSALS_CSV_WARNING)
      ) {
        this.setState({ showCSVWarning: true });
      }
      return await this.office.setDataset(freshDataset);
    } catch (error) {
      this.handleDatasetFetchError(error);
    }
  };

  createUrl = (uri) => {
    this.setState({ url: uri, showDatasets: false });
  };

  addUrl = (url) => {
    this.setState({ url });
  };

  async unlinkDataset() {
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
      this.setError(error);
    }
  }

  /**
   * Gets the user from the data.world API and sets it on the state
   */
  getUser = async () => {
    try {
      const user = await this.api.getUser();
      this.setState({ user });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.logout();
      }

      this.setError(error);
    }
  };

  /**
   * Removes and then recreates a binding with the active selection.
   * There is not currently a way to update the range for an existing binding
   * in the office API.
   */
  updateBinding = async (binding, selection) => {
    try {
      await this.removeBinding(binding);
      return this.createBinding(selection);
    } catch (error) {
      this.setError(error);
    }
  };

  /**
   * Highlights the address provided in the excel document
   */
  select = (address) => {
    this.office.select(address);
  };

  dismissError = () => {
    this.setState({ error: null });
  };

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
    };

    for (let row = 0; row < numberOfRows; row++) {
      for (let column = 0; column < numberOfColumns; column++) {
        // If current cell contains data
        if (grid[row][column]) {
          if (row < paramaters.firstRow) {
            paramaters.firstRow = row;
          }
          if (row > paramaters.lastRow) {
            paramaters.lastRow = row;
          }

          if (column < paramaters.firstColumn) {
            paramaters.firstColumn = column;
          }

          if (column > paramaters.lastColumn) {
            paramaters.lastColumn = column;
          }
        }
      }
    }

    // Remove blank rows and columns
    const trimmedRows = grid.slice(paramaters.firstRow, paramaters.lastRow + 1);
    const trimmedColumns = trimmedRows.map((row) => {
      return row.slice(paramaters.firstColumn, paramaters.lastColumn + 1);
    });

    const result = trimmedColumns.length > 0 ? trimmedColumns : [['']];
    return result;
  };

  getExcelBindings() {
    return new Promise((resolve, reject) => {
      this.office
        .getBindings()
        .then((bindings) => {
          resolve(bindings);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Replaces all the bindings stored in the state with those stored in Excel
   * while ensuring sheet bindings remain bound to the sheet
   */
  updateBindings = () => {
    return new Promise((resolve, reject) => {
      this.getExcelBindings().then((excelBindings) => {
        // Get all the current sheet bindings from state
        const sheetBindings = this.state.bindings.filter((binding) => {
          return isSheetBinding(binding);
        });
        const sheetBindingIds = sheetBindings.map((binding) => binding.id);

        // Remove all the current state bindings for replacement
        this.setState({ bindings: [] });
        const promises = [];

        excelBindings.forEach((binding) => {
          // Find sheet bindings whose binding range has changed in Excel but not in the state
          if (
            sheetBindingIds.indexOf(binding.id) > -1 &&
            !isSheetBinding(binding)
          ) {
            // Rebind changed bindings to the sheet
            const promise = new Promise((resolve, reject) => {
              // Sheet ID unavailable, use the sheet name instead
              const sheet = getSheetName(binding);
              // Extract file name from the binding id
              const name = binding.id.replace('dw::', '');
              const range = SHEET_RANGE;

              this.updateBinding(binding, { sheetId: sheet, range, name })
                .then(resolve)
                .catch(reject);
            });
            promises.push(promise);
          } else {
            // Simply add all other bindings to the state
            const stateBindings = this.state.bindings;
            stateBindings.push(binding);
            this.setState({ bindings: stateBindings });
          }
        });
        Promise.all(promises)
          .then(resolve)
          .catch(reject);
      });
    });
  };

  pushToLocalStorage = (id, dataset, filename, range, sheetId, date) => {
    const recentUploadData = {
      dataset: dataset,
      filename: filename,
      range: range,
      sheetId: sheetId,
      date: date,
      userId: this.state.user.id,
      workbook: this.state.workbookId
    };
    const toPush = JSON.stringify({ [id]: JSON.stringify(recentUploadData) });
    let parsedHistory = [];
    if (localStorage['history'] && localStorage['history'] !== '{}') {
      parsedHistory = JSON.parse(localStorage.getItem('history'));
    }

    var doesFilenameExist = -1;
    for (var i = 0; i < parsedHistory.length; ++i) {
      const parsedEntry = JSON.parse(parsedHistory[i]);
      if (
        parsedEntry.hasOwnProperty(id) &&
        JSON.parse(parsedEntry[id]).filename === id.replace('dw::', '')
      ) {
        const parsedObject = JSON.parse(parsedEntry[id]);
        if (
          parsedObject.userId === this.state.user.id &&
          parsedObject.workbook === this.state.workbookId
        ) {
          doesFilenameExist = i;
          break;
        }
      }
    }

    if (doesFilenameExist === -1) {
      parsedHistory.push(toPush);
    } else {
      parsedHistory[doesFilenameExist] = toPush;
    }
    localStorage.setItem('history', JSON.stringify(parsedHistory));
  };

  /**
   * Saves bindings to their associated files on data.world.  If a binding
   * is provided, then only that binding is saved to data.world.
   */
  sync = async (binding) => {
    const { currentSelectedRange } = this.state;
    try {
      this.setState({ syncing: true });
      // Actions such as deleting a column and renaming a sheet cause the value of Excel's bindings
      // to change, bindings must therefore be updated before a sync is attempted
      await this.updateBindings();
      return new Promise((resolve, reject) => {
        const bindings = binding ? [binding] : this.state.bindings;
        const promises = [];
        bindings.forEach((binding) => {
          const promise = new Promise((resolve, reject) => {
            this.office
              .getData(binding)
              .then((data) => {
                const trimmedData = this.trimFile(data);
                return this.api.uploadFile({
                  data: trimmedData,
                  dataset: this.state.url,
                  filename: binding.id.replace('dw::', '')
                });
              })
              .then(() => {
                const syncStatus = this.state.syncStatus;
                syncStatus[binding.id].synced = true;
                syncStatus[binding.id].changes = 0;
                syncStatus[binding.id].lastSync = new Date();
                this.office.setSyncStatus(syncStatus);
                this.setState({ syncStatus });
                this.pushToLocalStorage(
                  binding.id,
                  this.state.url,
                  binding.id.replace('dw::', ''),
                  binding.rangeAddress,
                  currentSelectedRange.worksheet.id,
                  new Date()
                );
                this.setState({ url: '', selectSheet: false });
                resolve();
              })
              .catch((error) => {
                this.setState({ error });
                this.setState({ syncing: false });
                reject();
              });
          });
          promises.push(promise);
        });
        Promise.all(promises)
          .then(() => {
            this.setState({ syncing: false });
            resolve();
          })
          .catch((error) => {
            this.setState({ syncing: false });
            reject();
          });
      });
    } catch (updateBindingError) {
      this.setState({
        syncing: false,
        error: {
          error: updateBindingError,
          message: 'There was an error updating the bindings, please try again.'
        }
      });
    }
  };

  showCreateDataset = () => {
    this.setState({ showCreateDataset: true });
  };

  toggleShowDatasets = () => {
    this.setState({ showDatasets: !this.state.showDatasets });
  };

  closeAddData = () => {
    this.office.stopListeningForSelectionChanges();
    this.setState({
      showAddDataModal: false,
      addDataModalOptions: {},
      forceShowUpload: false,
      url: '',
      error: null
    });
  };

  dismissCSVWarning = (options) => {
    if (options.dismissWarning) {
      this.state.preferences.dismissals.push(DISMISSALS_CSV_WARNING);
      localStorage.setItem(
        DW_PREFERENCES,
        JSON.stringify(this.state.preferences)
      );
    }

    this.setState({
      showCSVWarning: false,
      preferences: this.state.preferences
    });
  };

  createDataset = async (dataset) => {
    try {
      return await this.api.createDataset(this.state.user.id, dataset);
    } catch (datasetError) {
      this.setError(datasetError);
    }
  };

  createProject = (project) => {
    return this.api.createProject(this.state.user.id, project);
  };

  doesFileExist = (filename) => {
    let fileExists = false;
    this.state.dataset &&
      this.state.dataset.files.forEach((file) => {
        if (file.name === filename) {
          fileExists = true;
        }
      });
    return fileExists;
  };

  hasBeenDismissed = (key) => {
    return this.state.preferences.dismissals.find((dismissal) => {
      return dismissal === key;
    });
  };

  getCharts = () => {
    return new Promise((resolve, reject) => {
      this.office
        .getWorksheets()
        .then((worksheets) => {
          const promises = worksheets.map((worksheet) =>
            this.office.getCharts(worksheet.id)
          );
          Promise.all(promises)
            .then((allCharts) => {
              // Some worksheets may not contain charts
              const charts = allCharts.filter((chart) => chart.length > 0);

              // charts is an array of arrays, flatten before resolving
              resolve(flatten(charts));
            })
            .catch(reject);
        })
        .catch(reject);
    });
  };

  uploadChart = (imageString, options) => {
    return this.api.uploadChart(imageString, options);
  };

  toggleForceShowUpload = () => {
    this.setState({ forceShowUpload: true });
  };

  setError = (error) => {
    this.setState({
      error
    });
  };

  getWorkbookId = async () => {
    const workbookId = await this.office.getWorkbookId();
    this.setState({ workbookId });
  };

  render() {
    if (this.state.error) {
      throw this.state.error;
    }
    const {
      currentSelectedRange,
      dataset,
      datasets,
      error,
      excelApiSupported,
      loadingDatasets,
      loggedIn,
      officeInitialized,
      showCreateDataset,
      user,
      page,
      charts,
      projects,
      version,
      insideOffice,
      showDatasets,
      url,
      forceShowUpload,
      selectSheet,
      bindings,
      syncStatus
    } = this.state;

    let errorMessage = error;
    if (error && typeof error !== 'string') {
      errorMessage = error.message;
    }

    const showStartPage = officeInitialized && !loggedIn;

    const insights = page === 'insights';
    const importData = page === 'import';

    const uploadDataView =
      !showStartPage &&
      !showCreateDataset &&
      !insights &&
      !importData &&
      !showDatasets;
    const userId = user ? user.id : 'Undefined';
    const renderInsights = !showStartPage && insights;
    const renderImportData = !showStartPage && importData;
    let numItemsInHistory = 0;
    if (!insideOffice) {
      return <NotOfficeView />;
    }

    const localHistory = localStorage.getItem('history');
    let matchedFiles; // all files which has the same username and workspace id as the current user
    if (localHistory) {
      const allFiles = JSON.parse(localHistory);
      if (allFiles) {
        matchedFiles = allFiles
          .filter((file) => {
            const parsedEntry = JSON.parse(
              Object.keys(JSON.parse(file)).map(
                (key) => JSON.parse(file)[key]
              )[0]
            );
            return (
              this.state.user &&
              this.state.user.id === parsedEntry.userId &&
              parsedEntry.workbook === this.state.workbookId
            );
          })
          .reverse();
        numItemsInHistory = matchedFiles.length;
      }
    }
    return (
      <div>
        {error && (
          <Alert bsStyle="danger" onDismiss={this.dismissError}>
            {errorMessage}
          </Alert>
        )}
        {!officeInitialized && !error && <LoadingAnimation />}
        {loggedIn && (
          <LoginHeader user={user} logout={this.logout} page={page} />
        )}
        {showStartPage && (
          <WelcomePage dataset={dataset} page={page} version={version} />
        )}

        {((forceShowUpload && !showDatasets && !showCreateDataset) ||
          (uploadDataView && numItemsInHistory === 0)) && (
          <UploadModal
            excelApiSupported={excelApiSupported}
            range={currentSelectedRange}
            showDatasets={this.toggleShowDatasets}
            url={url}
            updateBinding={this.updateBinding}
            doesFileExist={this.doesFileExist}
            createBinding={this.createBinding}
            sync={this.sync}
            refreshLinkedDataset={this.refreshLinkedDataset}
            close={this.closeAddData}
            linkDataset={this.createUrl}
            numItemsInHistory={numItemsInHistory}
            changeSelection={this.changeSelection}
            selectSheet={selectSheet}
            addUrl={this.addUrl}
            loading={this.state.syncing}
            getSelectionRange={this.getSelectionRange}
            error={error}
          />
        )}

        {!forceShowUpload &&
          uploadDataView &&
          numItemsInHistory > 0 &&
          !showStartPage && (
            <RecentUploads
              refreshLinkedDataset={this.refreshLinkedDataset}
              sync={this.sync}
              forceShowUpload={this.toggleForceShowUpload}
              createBinding={this.createBinding}
              addUrl={this.addUrl}
              user={userId}
              workbook={this.state.workbookId}
              matchedFiles={matchedFiles}
              bindings={bindings}
              syncStatus={syncStatus}
            />
          )}

        {showCreateDataset && (
          <CreateDatasetModal
            user={user}
            createDataset={this.createDataset}
            close={() => this.setState({ showCreateDataset: false })}
            linkDataset={this.createUrl}
            showDatasets={this.toggleShowDatasets}
          />
        )}

        {!showStartPage &&
          showDatasets && (
            <DatasetsView
              datasets={datasets}
              createDataset={this.showCreateDataset}
              linkDataset={this.linkDataset}
              loadingDatasets={loadingDatasets}
              showDatasets={this.toggleShowDatasets}
              showCreateDataset={this.showCreateDataset}
            />
          )}

        {renderInsights && (
          <Insights
            getImageAndTitle={this.office.getImageAndTitle}
            charts={charts}
            user={user}
            officeInitialized={officeInitialized}
            projects={projects}
            createProject={this.createProject}
            uploadChart={this.uploadChart}
            setError={this.setError}
          />
        )}

        {renderImportData && <ImportData />}
        <CSVWarningModal
          show={this.state.showCSVWarning}
          successHandler={this.dismissCSVWarning}
        />
      </div>
    );
  }
}
