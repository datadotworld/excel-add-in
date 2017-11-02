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
import OfficeConnector from './OfficeConnector';
import DataDotWorldApi from './DataDotWorldApi';
import analytics from './analytics';

const DW_API_TOKEN = 'DW_API_TOKEN';
const DW_PREFERENCES = 'DW_PREFERENCES';
const DISMISSALS_CSV_WARNING = 'CSV_DISMISSAL_WARNING';
const { localStorage } = window;

const MAXIMUM_COLUMNS = 150;

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

    this.state = {
      token,
      preferences,
      bindings: [],
      datasets: [],
      loadingDatasets: false,
      loggedIn: !!token,
      officeInitialized: false,
      syncStatus: {}
    };

    if (token) {
      this.api = new DataDotWorldApi(token);
      this.getUser();
    }

    this.initializeOffice();
  }

  async initializeOffice () { 
    this.office = new OfficeConnector();
    try {
      await this.office.initialize();
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
    } catch (error) {
      this.setState({
        error: {
          error,
          message: 'There was an error initializing the Office connector, please try again.'
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

  async createBinding (filename) {
    try {
      const binding = await this.office.createBinding(filename);
      if (binding.columnCount > MAXIMUM_COLUMNS) {
        await this.office.removeBinding(binding);
        throw new Error(`The maximum number of columns is ${MAXIMUM_COLUMNS}.  If you need to bind to more columns than that, please upload your Excel file to data.world directly. `);
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
      bindings.splice(bindings.indexOf(binding), 1);
      this.setState({ bindings });
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

  async refreshLinkedDataset (datasetToRefresh = this.state.dataset) {
    try {
      const dataset = await this.api.getDataset(`${datasetToRefresh.owner}/${datasetToRefresh.id}`);
      this.office.setDataset(dataset);
      this.setState({ dataset });

      return dataset;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.logout();
      } else {
        this.setState({error});
      }
    }
  }

  async linkNewDataset (datasetUrl) {
    try {
      const dataset = await this.api.getDataset(datasetUrl);
      return await this.linkDataset(dataset);
    } catch (error) {
      this.setState({error});
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
      this.setState({error});
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
  async updateBinding (binding, filename) {
    try {
      await this.removeBinding(binding);
      return this.createBinding(filename);
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
   * Saves bindings to their associated files on data.world.  If a binding
   * is provided, then only that binding is saved to data.world.
   */
  sync = (binding) => {
    this.setState({syncing: true});
    return new Promise((resolve, reject) => {
      const bindings = binding ? [binding] : this.state.bindings;
      const promises = [];
      bindings.forEach((binding) => {
        const promise = new Promise((resolve, reject) => {
          this.office.getData(binding).then((data) => {
            return this.api.uploadFile({
              data,
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
  }

  showCreateDataset = () => {
    this.setState({showCreateDataset: true});
  }

  showAddData = (filename, binding) => {

    if (binding) {
      this.office.select(binding.rangeAddress);
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
      user
    } = this.state;

    let errorMessage = error;
    if (error && typeof error !== 'string') {
      errorMessage = error.message;
    }

    const showStartPage = officeInitialized && !loggedIn;
    const modalViewOpened = showAddDataModal || showCreateDataset;

    return (
      <div>
        {error && <Alert bsStyle='warning' onDismiss={this.dismissError}>{errorMessage}</Alert>}
        {!officeInitialized && !error && <LoadingAnimation />}
        {loggedIn && <LoginHeader user={user} logout={this.logout} />}
        {showStartPage && <WelcomePage dataset={dataset} />}
        {!showStartPage && !modalViewOpened && dataset && <BindingsPage
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

        {!showStartPage && !dataset && !showCreateDataset && <DatasetsView 
          datasets={datasets}
          createDataset={this.showCreateDataset}
          linkDataset={this.linkDataset}
          loadingDatasets={loadingDatasets}
        />}

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
        <CSVWarningModal show={this.state.showCSVWarning} successHandler={this.dismissCSVWarning} />
      </div>
    );
  }
}

export default App;
