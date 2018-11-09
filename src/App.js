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
      this.getUser()
        .then(() => {
          // Ignore
        })
        .catch((error) => {
          this.setError(error);
        });
    }

    this.initializeOffice()
      .then(() => {
        // Ignore
      })
      .catch((error) => {
        this.setError(error);
      });
  }

  getSelectionRange = async () => {
    try {
      const currentSelectedRange = await this.office.getCurrentlySelectedRange();
      this.office.listenForSelectionChanges((newSelectedRange) => {
        this.setState({ currentSelectedRange: newSelectedRange });
      });

      this.setState({ currentSelectedRange });
      return currentSelectedRange;
    } catch (selectionRangeError) {
      this.setError(selectionRangeError);
    }
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
        await this.initializeInsights();
      } else if (page === IMPORT_ROUTE) {
        return this.setState({ officeInitialized: true });
      } else {
        await this.initializeDatasets();
      }
      await this.getWorkbookId();
    } catch (error) {
      this.setError(error);
    }
  };

  initializeDatasets = async () => {
    if (!this.state.loggedIn) {
      return this.setState({ officeInitialized: true, outsideOffice: false });
    }

    const { pushToLocalStorage, office } = this;
    const settings = this.office.getSettings();

    let { dataset, nextMigrationIndex } = settings;
    nextMigrationIndex = nextMigrationIndex || 0;
    const bindings = await this.office.getBindings();

    if (dataset) {
      migrations.slice(nextMigrationIndex).forEach((migrationFn, idx) => {
        try {
          migrationFn({
            bindings,
            pushToLocalStorage,
            dataset,
            getSheetId: office.getSheetId
          });
          office.setNextMigrationIndex(nextMigrationIndex + idx + 1);

          // To show migrated files
          window.location.reload();
        } catch (migrationError) {
          this.setError(migrationError);
        }
      });
    }

    this.setState({
      excelApiSupported: this.office.isExcelApiSupported(),
      officeInitialized: true,
      outsideOffice: false,
      csvMode: this.office.isCSV()
    });
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

  getDatasets = async () => {
    try {
      this.setState({ loadingDatasets: true });
      const datasets = await this.api.getDatasets();
      this.setState({ datasets, loadingDatasets: false });
    } catch (getDatasetsError) {
      this.setState({
        error: getDatasetsError,
        loadingDatasets: false
      });
    }
  };

  handleDatasetFetchError = async (error) => {
    if (error.response && error.response.status === 401) {
      return this.logout();
    } else if (error.response && error.response.status === 404) {
      await this.unlinkDataset();
      return this.setError(new Error('Dataset not found'));
    } else {
      return this.setError(error);
    }
  };

  linkDataset = async (dataset) => {
    this.setState({ url: dataset, showDatasets: false });
    const regexMatch = /https:\/\/data\.world\/([^/?#]*)\/([^/?#]*)?/;
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
      await this.handleDatasetFetchError(error);
    }
  };

  createUrl = (uri) => {
    this.setState({ url: uri, showDatasets: false });
  };

  addUrl = (url) => {
    this.setState({ url });
  };

  unlinkDataset = async () => {
    try {
      await this.office.setDataset(null);
      await this.getDatasets();
      this.setState({
        dataset: null,
        syncStatus: {}
      });
    } catch (error) {
      this.setError(error);
    }
  };

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
   * Highlights the address provided in the excel document
   */
  select = (address) => {
    this.office.select(address);
  };

  dismissError = () => {
    this.setState({ errorMessage: null });
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

  pushToLocalStorage = async (
    dataset,
    filename,
    rangeAddress,
    worksheetId,
    date
  ) => {
    const recentUploads = localStorage.getItem('history')
      ? JSON.parse(localStorage.getItem('history'))
      : [];
    const workbook =
      this.state.workbookId || (await this.office.getWorkbookId());

    const newUpload = {
      dataset,
      filename,
      rangeAddress,
      userId: this.state.user.id,
      workbook,
      worksheetId,
      date
    };

    const fileIndex = recentUploads.findIndex((upload) => {
      if (upload.filename === filename) {
        if (
          upload.userId === this.state.user.id &&
          upload.workbook === this.state.workbookId
        ) {
          return true;
        }
      }

      return false;
    });

    if (fileIndex === -1) {
      recentUploads.push(newUpload);
    } else {
      recentUploads[fileIndex] = newUpload;
    }

    localStorage.setItem('history', JSON.stringify(recentUploads));
  };

  getRangeValues = async (rangeAddress) => {
    try {
      const values = await this.office.getRangeValues(rangeAddress);
      return values;
    } catch (rangeValuesError) {
      this.setError(rangeValuesError);
    }
  };

  createBinding = async (worksheetId, range, filename) => {
    try {
      const namedItem = await this.office.createSelectionRange(
        worksheetId,
        range
      );
      const binding = await this.office.createBinding(filename, namedItem);

      return binding;
    } catch (error) {
      this.setState({ error });
    }
  };

  /**
   * Saves data in specified range to its associated file on data.world.
   */
  sync = async (filename, rangeAddress, dataset, worksheetId) => {
    try {
      this.setState({ syncing: true });

      const binding = await this.createBinding(
        worksheetId,
        rangeAddress.split('!')[1],
        filename
      );
      const values = await this.office.getData(binding);

      if (values) {
        const trimmedData = this.trimFile(values);
        await this.api.uploadFile({
          data: trimmedData,
          dataset,
          filename
        });

        this.pushToLocalStorage(
          dataset,
          filename,
          rangeAddress,
          worksheetId,
          new Date()
        );

        try {
          await this.office.removeBinding(binding);
        } catch (removeBindingError) {
          this.setState({
            error: removeBindingError
          });
        }

        this.setState({ syncing: false });
      } else {
        this.setState({
          syncing: false,
          error: new Error('Error retrieving data from specified selection')
        });
      }
    } catch (uploadError) {
      this.setState({
        syncing: false,
        error: uploadError
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

  getCharts = async () => {
    try {
      const worksheets = await this.office.getWorksheets();
      const promises = worksheets.map((worksheet) =>
        this.office.getCharts(worksheet.id)
      );

      try {
        const allCharts = await Promise.all(promises);

        // Some worksheets may not contain charts
        const charts = allCharts.filter((chart) => chart.length > 0);

        // charts is an array of arrays, flatten before resolving
        return flatten(charts);
      } catch (getChartsError) {
        this.setError(getChartsError);
      }
    } catch (getWorksheetsError) {
      this.setError(getWorksheetsError);
    }
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

  setErrorMessage = (errorMessage) => {
    this.setState({
      errorMessage
    });
  };

  getWorkbookId = async () => {
    try {
      const workbookId = await this.office.getWorkbookId();
      this.setState({ workbookId });
    } catch (getWorkbookIdError) {
      this.setError(this.getWorkbookIdError);
    }
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
      errorMessage
    } = this.state;

    const showStartPage = officeInitialized && !loggedIn;

    const insights = page === 'insights';
    const importData = page === 'import';

    const uploadDataView =
      officeInitialized &&
      !showStartPage &&
      !showCreateDataset &&
      !insights &&
      !importData &&
      !showDatasets;
    const userId = user ? user.id : 'Undefined';
    const renderInsights = !showStartPage && insights;
    const renderImportData = !showStartPage && importData;

    if (!insideOffice) {
      return <NotOfficeView />;
    }

    const recentUploads = localStorage.getItem('history');
    let matchedFiles = [];

    // all files which has the same username and workspace id as the current user
    if (recentUploads) {
      try {
        const allFiles = JSON.parse(recentUploads);
        matchedFiles = allFiles
          .filter((file) => {
            return (
              this.state.user &&
              this.state.user.id === file.userId &&
              file.workbook === this.state.workbookId
            );
          })
          .sort((a, b) => {
            // Sort by date
            if (a.date < b.date) {
              return 1;
            }
            if (a.date > b.date) {
              return -1;
            }

            return 0;
          });
      } catch (parsingError) {
        this.setError(parsingError);
      }
    }

    const numItemsInHistory = matchedFiles.length;
    return (
      <div>
        {errorMessage && (
          <Alert
            bsStyle="danger"
            className="error-alert"
            onDismiss={this.dismissError}
          >
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
            doesFileExist={this.doesFileExist}
            sync={this.sync}
            setError={this.setError}
            setErrorMessage={this.setErrorMessage}
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
              sync={this.sync}
              setError={this.setError}
              forceShowUpload={this.toggleForceShowUpload}
              addUrl={this.addUrl}
              user={userId}
              workbook={this.state.workbookId}
              matchedFiles={matchedFiles}
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

        {!showStartPage && showDatasets && (
          <DatasetsView
            datasets={datasets}
            createDataset={this.showCreateDataset}
            linkDataset={this.linkDataset}
            loadingDatasets={loadingDatasets}
            showDatasets={this.toggleShowDatasets}
            showCreateDataset={this.showCreateDataset}
            getDatasets={this.getDatasets}
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
