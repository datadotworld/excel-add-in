import React, { Component } from 'react';
import queryString from 'query-string'

import { Alert } from 'react-bootstrap';

import './App.css';
import './static/css/dw-bootstrap.min.css';

import CreateDatasetModal from './components/CreateDatasetModal';
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
      loggedIn: !!token
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
      const { dataset } = this.office.getSettings();
      if (! dataset && this.state.loggedIn) {
        this.getDatasets();
      }
      this.setState({dataset});
      const bindings = await this.office.getBindings();
      this.setState({
        bindings,
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
    console.log('listen for changes to binding %s', binding.id);
    this.office.listenForChanges(binding, (event) => {
      console.log(event.binding.id);
    });
  }

  async createBinding (filename) {
    try {
      const binding = await this.office.createBinding(filename);
      if (binding.columnCount > MAXIMUM_COLUMNS) {
        await this.office.removeBinding(binding);
        throw new Error(`The maximum number of columns is ${MAXIMUM_COLUMNS}.  If you need to bind to more columns than that, please upload your Excel file to data.world directly. `);
      }

      this.state.bindings.push(binding);
      this.setState({ bindings: this.state.bindings });
      
      this.listenForChangesToBinding(binding);
      await this.office.getBindingRange(binding);

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
      this.setState({ dataset: null });
      this.getDatasets();
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

  sync = () => {
    const {bindings} = this.state;
    bindings.forEach((binding) => {
      this.office.getData(binding).then((data) => {
        console.log(data);
      }).catch((error) => {
        this.setState({error});
      });
    });
  }

  showCreateDataset = () => {
    this.setState({showCreateDataset: true});
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
      bindings,
      dataset,
      datasets,
      error,
      loggedIn,
      officeInitialized,
      showCreateDataset,
      user
    } = this.state;

    let errorMessage = error;
    if (error && typeof error !== 'string') {
      errorMessage = error.message;
    }

    const showStartPage = officeInitialized && !loggedIn;
    const showBindingsPage = officeInitialized && !showStartPage && loggedIn;

    return (
      <div>
        {error && <Alert bsStyle='warning' onDismiss={this.dismissError}>{errorMessage}</Alert>}
        {!officeInitialized && !error && <LoadingAnimation />}
        {loggedIn && <LoginHeader user={user} logout={this.logout} />}
        {showStartPage && <WelcomePage dataset={dataset} />}
        {!showStartPage && dataset && <BindingsPage 
          bindings={bindings}
          loggedIn={loggedIn}
          dataset={dataset}
          createBinding={this.createBinding}
          removeBinding={this.removeBinding}
          unlinkDataset={this.unlinkDataset}
          sync={this.sync}
        />}

        {!showStartPage && !dataset && <DatasetsView 
          datasets={datasets}
          createDataset={this.showCreateDataset}
          linkDataset={this.linkDataset}
        />}
        {showCreateDataset && <CreateDatasetModal user={user} linkNewDataset={this.linkNewDataset} createDataset={this.createDataset} close={() => this.setState({showCreateDataset: false})} />}
      </div>
    );
  }
}

export default App;
