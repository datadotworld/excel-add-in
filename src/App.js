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
import { flatten, findIndex, isEqual, remove } from 'lodash';

import { Alert } from 'react-bootstrap';
import find from 'array.prototype.find';

import './App.css';
import './static/css/dw-bootstrap.min.css';

import CreateItemModal from './components/CreateItemModal';
import WelcomePage from './components/WelcomePage';
import LibraryView from './components/LibraryView';
import LoadingAnimation from './components/LoadingAnimation';
import LoginHeader from './components/LoginHeader';
import Insights from './components/Insights';
import NotOfficeView from './components/NotOfficeView';
import ImportData from './components/ImportData';

import OfficeConnector from './OfficeConnector';
import DataDotWorldApi from './DataDotWorldApi';
import analytics from './analytics';
import UploadModal from './components/UploadModal';
import RecentUploads from './components/RecentUploads';

import migrations from './migrations';

const DW_API_TOKEN = 'DW_API_TOKEN';
const DW_APP_VERSION = 'DW_APP_VERSION';
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
      loadingDatasets: false,
      loadingProjects: false,
      loggedIn: !!token,
      officeInitialized: false,
      syncStatus: {},
      page,
      charts: [],
      version: localStorage.getItem(DW_APP_VERSION, version),
      insideOffice,
      showDatasets: false,
      url: '',
      forceShowUpload: false,
      loadingSync: false,
      selectSheet: false,
      recents: localStorage.getItem('history')
    };

    this.initializeUserAndOffice().then(() => {
      this.setState({
        officeInitialized: true
      });
    });
  }

  initializeUserAndOffice = async () => {
    const { token } = this.state;
    if (token) {
      this.api = new DataDotWorldApi(token);
      await this.getUser();
    }

    await this.initializeOffice();
  };

  getSelectionRange = async () => {
    this.office.listenForSelectionChanges((newSelectedRange) => {
      this.setState({ currentSelectedRange: newSelectedRange });
    });

    try {
      const currentSelectedRange = await this.office.getCurrentlySelectedRange();

      this.setState({ currentSelectedRange });
      return currentSelectedRange;
    } catch (e) {
      this.setState({ currentSelectedRange: null });
      return null;
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
      await this.getWorkbookId();
      if (page === INSIGHTS_ROUTE) {
        await this.initializeInsights();
      } else if (page !== IMPORT_ROUTE) {
        await this.initializeDatasets();
      }
    } catch (error) {
      this.setError(error);
    }
  };

  initializeDatasets = async () => {
    if (this.state.loggedIn) {
      const { pushToLocalStorage, office } = this;
      const settings = this.office.getSettings();

      let { dataset, nextMigrationIndex } = settings;
      nextMigrationIndex = nextMigrationIndex || 0;
      const bindings = await this.office.getBindings();

      if (dataset) {
        migrations
          .slice(nextMigrationIndex)
          .forEach(async (migrationFn, idx) => {
            try {
              await migrationFn({
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
        excelApiSupported: this.office.isExcelApiSupported()
      });
    }
  };

  initializeInsights = async () => {
    if (this.state.loggedIn) {
      try {
        // All the charts in the workbook
        const charts = await this.getCharts();
        this.setState({ charts });
      } catch (getChartsError) {
        this.setError(getChartsError);
      }
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

  getDatasets = async (onlyShowWritableDatasets) => {
    try {
      this.setState({ loadingDatasets: true });
      const datasets = await this.api.getDatasets(onlyShowWritableDatasets);
      this.setState({ loadingDatasets: false });
      return datasets;
    } catch (getDatasetsError) {
      this.setState({
        error: getDatasetsError,
        loadingDatasets: false
      });
    }
  };

  getProjects = async () => {
    try {
      this.setState({ loadingProjects: true });

      // Logged in user's projects
      const projects = await this.api.getProjects();
      this.setState({ loadingProjects: false });
      return projects;
    } catch (getProjectsError) {
      this.setState({
        error: getProjectsError
      });
    }
  };

  selectDataset = (dataset) => {
    this.setState({ url: dataset, showDatasets: false });
  };

  addUrl = (url) => {
    this.setState({ url });
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

  pushToLocalStorage = (dataset, filename, rangeAddress, worksheetId, date) => {
    const recents = localStorage.getItem('history')
      ? JSON.parse(localStorage.getItem('history'))
      : {};
    const { recentUploads = [] } = recents;
    const workbook = this.state.workbookId;

    const newUpload = {
      dataset,
      filename,
      rangeAddress,
      userId: this.state.user.id,
      workbook,
      worksheetId,
      date
    };

    const fileIndex = findIndex(recentUploads, (upload) => {
      // Same file uploaded to the same dataset
      if (
        upload.filename === filename &&
        upload.dataset.owner === dataset.owner &&
        upload.dataset.id === dataset.id
      ) {
        // By the same user on the same workbook
        if (
          upload.userId === this.state.user.id &&
          upload.workbook === this.state.workbookId
        ) {
          // Return the index of the file
          return true;
        }
      }

      return false;
    });

    if (fileIndex === -1) {
      recentUploads.push(newUpload);
    } else {
      // Replace duplicate file
      recentUploads[fileIndex] = newUpload;
    }

    recents.recentUploads = recentUploads;

    localStorage.setItem('history', JSON.stringify(recents));
    this.setState({ recents: JSON.stringify(recents) });
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
    let binding;
    try {
      this.setState({ syncing: true });

      binding = await this.createBinding(
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
    } finally {
      try {
        await this.office.removeBinding(binding);
      } catch (removeBindingError) {
        this.setState({
          error: removeBindingError
        });
      }
    }
  };

  deleteRecentItem = async (type, item) => {
    const recents = localStorage.getItem('history') || {};
    const recentsObject = JSON.parse(recents);
    let allItems;

    if (type === 'recentImports') {
      const { recentImports = [] } = recentsObject;
      allItems = recentImports;
    } else {
      const { recentUploads = [] } = recentsObject;
      allItems = recentUploads;
    }

    const updatedRecentItems = remove(allItems, (recent) => {
      return !isEqual(recent, item);
    });

    recentsObject[type] = updatedRecentItems;

    localStorage.setItem('history', JSON.stringify(recentsObject));
    this.setState({ recents: JSON.stringify(recentsObject) });
  };

  showCreateDataset = () => {
    this.setState({ showCreateDataset: true });
  };

  toggleList = (onlyShowWritableDatasets = false) => {
    this.setState({
      showDatasets: !this.state.showDatasets,
      onlyShowWritableDatasets
    });
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

  createDataset = async (dataset) => {
    try {
      const createdDataset = await this.api.createDataset(
        this.state.user.id,
        dataset
      );

      return createdDataset;
    } catch (error) {
      if (error && error.response && error.response.data) {
        this.setState({
          errorMessage: error.response.data.message
        });
      } else {
        this.setError(error);
      }

      throw error;
    }
  };

  createProject = async (project) => {
    try {
      const createdProject = await this.api.createProject(
        this.state.user.id,
        project
      );

      return createdProject;
    } catch (error) {
      if (error && error.response && error.response.data) {
        this.setState({
          errorMessage: error.response.data.message
        });
      } else {
        this.setError(error);
      }

      throw error;
    }
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
      error,
      excelApiSupported,
      loadingDatasets,
      loadingProjects,
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
      errorMessage,
      onlyShowWritableDatasets,
      recents
    } = this.state;

    if (!insideOffice) {
      return <NotOfficeView />;
    }

    if (!officeInitialized) {
      return <LoadingAnimation />;
    }

    const showStartPage = !loggedIn;
    const insights = page === 'insights';

    const importData = page === 'import';
    const uploadDataView =
      !showStartPage &&
      !showCreateDataset &&
      !insights &&
      !importData &&
      !showDatasets;
    const userId = user ? user.id : 'Undefined';
    const renderInsights = !showStartPage && insights && this.office;

    const renderImportData = !showStartPage && importData;

    let matchedFiles = [];

    // all files which has the same username and workspace id as the current user
    if (recents) {
      try {
        const allUploads = JSON.parse(recents).recentUploads || [];
        matchedFiles = allUploads
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
            toggleList={this.toggleList}
            url={url}
            doesFileExist={this.doesFileExist}
            sync={this.sync}
            setError={this.setError}
            setErrorMessage={this.setErrorMessage}
            close={this.closeAddData}
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
              getSheetName={this.office.getSheetName}
              deleteRecentItem={this.deleteRecentItem}
            />
          )}

        {showCreateDataset && (
          <CreateItemModal
            user={user}
            createItem={this.createDataset}
            close={() => this.setState({ showCreateDataset: false })}
            selectItem={this.selectDataset}
            itemType="dataset"
          />
        )}

        {!showStartPage && showDatasets && !showCreateDataset && (
          <LibraryView
            onSelect={this.selectDataset}
            loading={loadingDatasets}
            toggleList={this.toggleList}
            toggleShowForm={this.showCreateDataset}
            getItems={this.getDatasets}
            onlyShowWritableDatasets={onlyShowWritableDatasets}
          />
        )}

        {renderInsights && (
          <Insights
            getImageAndTitle={this.office.getImageAndTitle}
            charts={charts}
            user={user}
            projects={projects}
            createProject={this.createProject}
            uploadChart={this.uploadChart}
            setError={this.setError}
            setErrorMessage={this.setErrorMessage}
            getProjects={this.getProjects}
            loadingProjects={loadingProjects}
          />
        )}

        {renderImportData && (
          <ImportData
            getDatasets={this.getDatasets}
            api={this.api}
            office={this.office}
            user={this.state.user}
            workbookId={this.state.workbookId}
            setError={this.setError}
            setErrorMessage={this.setErrorMessage}
            deleteRecentItem={this.deleteRecentItem}
          />
        )}
      </div>
    );
  }
}
