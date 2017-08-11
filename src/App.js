import React, { Component } from 'react';
import queryString from 'query-string'

import { Alert } from 'react-bootstrap';

import './App.css';
import './static/css/dw-bootstrap.min.css';

import CreateDatasetModal from './components/CreateDatasetModal';
import AddDataModal from './components/AddDataModal';
import WelcomePage from './components/WelcomePage';
import BindingsPage from './components/BindingsPage';
import DatasetsView from './components/DatasetsView';
import LoadingAnimation from './components/LoadingAnimation';
import LoginHeader from './components/LoginHeader';
import OfficeConnector from './OfficeConnector';
import DataDotWorldApi from './DataDotWorldApi';

const DW_API_TOKEN = 'DW_API_TOKEN';
const { localStorage } = window;

const MAXIMUM_COLUMNS = 150;

class App extends Component {

  constructor () {
    super();

    this.createBinding = this.createBinding.bind(this);
    this.getDatasets = this.getDatasets.bind(this);
    this.linkDataset = this.linkDataset.bind(this);
    this.removeBinding = this.removeBinding.bind(this);
    this.unlinkDataset = this.unlinkDataset.bind(this);
    this.createDataset = this.createDataset.bind(this);
    this.linkNewDataset = this.linkNewDataset.bind(this);
    this.refreshLinkedDataset = this.refreshLinkedDataset.bind(this);

    this.parsedQueryString = queryString.parse(window.location.search);

    let token;
    if (this.parsedQueryString.token) {
      token = this.parsedQueryString.token;
      localStorage.setItem(DW_API_TOKEN, token);
      this.setState({ token });
    } else {
      token = localStorage.getItem(DW_API_TOKEN);
    }

    this.state = {
      token,
      bindings: [],
      datasets: [],
      loggedIn: !!token,
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
        officeInitialized: true
      });

      bindings.forEach(this.listenForChangesToBinding);
    } catch (error) {
      this.setState({error});
    }
  }

  logout = () => {
    localStorage.setItem(DW_API_TOKEN, '');
    this.setState({token: null, loggedIn: false, user: null});
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
      const datasets = await this.api.getDatasets();
      this.setState({datasets});
    } catch (error) {
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
      this.setState({error});
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
      this.setState({ dataset });
      return await this.office.setDataset(dataset);
    } catch (error) {
      this.setState({error});
    }
  }

  async unlinkDataset () {
    try {
      await this.office.setDataset();
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

  async getUser () {
    try {
      const user = await this.api.getUser();
      this.setState({user});
    } catch (error) {
      console.log(error);
    }
  }

  dismissError = () => {
    this.setState({ error: null });
  }

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
            this.setState({ syncStatus });
            resolve();
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

  showAddData = (file) => {
    // Listen for changes to the selected range
    this.office.listenForSelectionChanges((currentSelectedRange) => {
      this.setState({currentSelectedRange});
    });

    // But also grab the current selection
    this.office.getCurrentlySelectedRange().then((currentSelectedRange) => {
      this.setState({currentSelectedRange});
    });

    this.setState({showAddDataModal: true, addDataModalFile: file});
  }

  closeAddData = () => {
    this.office.stopListeningForSelectionChanges();
    this.setState({showAddDataModal: false});
  }

  async createDataset (dataset) {
    try {
      return await this.api.createDataset(this.state.user.id, dataset);
    } catch (error) {
      this.setState({error});
    }
  }
  
  render () {
    const {
      addDataModalFile,
      bindings,
      currentSelectedRange,
      dataset,
      datasets,
      error,
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
          loggedIn={loggedIn}
          dataset={dataset}
          createBinding={this.createBinding}
          removeBinding={this.removeBinding}
          unlinkDataset={this.unlinkDataset}
          showAddData={this.showAddData}
          sync={this.sync}
          syncing={syncing}
          syncStatus={syncStatus}
        />}

        {!showStartPage && !dataset && <DatasetsView 
          datasets={datasets}
          createDataset={this.showCreateDataset}
          linkDataset={this.linkDataset}
        />}

        {showCreateDataset && <CreateDatasetModal 
          user={user}
          linkNewDataset={this.linkNewDataset}
          createDataset={this.createDataset} close={() => this.setState({showCreateDataset: false})} 
        />}

        {showAddDataModal && <AddDataModal 
          sync={this.sync}
          range={currentSelectedRange}
          close={this.closeAddData}
          file={addDataModalFile}
          createBinding={this.createBinding}
          refreshLinkedDataset={this.refreshLinkedDataset}
        />}
      </div>
    );
  }
}

export default App;
