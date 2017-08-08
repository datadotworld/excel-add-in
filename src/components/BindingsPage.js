import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {FormattedDate} from 'react-intl';

import { 
  Button,
  Col,
  ControlLabel,
  Dropdown,
  DropdownButton,
  Glyphicon,
  Grid,
  MenuItem,
  Row
} from 'react-bootstrap';

import './BindingsPage.css';
import BindingListItem from './BindingListItem';
import FileInput from './FileInput';

import DatasetSchema from './icons/DatasetSchema';

class BindingsPage extends Component {

  static propTypes = {
    bindings: PropTypes.array,
    createBinding: PropTypes.func,
    createDataset: PropTypes.func,
    dataset: PropTypes.object,
    datasets: PropTypes.array,
    linkDataset: PropTypes.func,
    loggedIn: PropTypes.bool,
    removeBinding: PropTypes.func,
    setDataset: PropTypes.func,
    sync: PropTypes.func
  }

  state = {
    showFileInput: false,
    sortKey: 'updated'
  }

  getFilenameFromBinding = (binding) => {
    return `${binding.id.replace('dw::', '')}.csv`;
  }

  addFile = () => {
    this.setState({
      showFileInput: true
    });
  }

  createBinding = (filename) => {
    this.props.createBinding(filename).then(() => {
      this.setState({showFileInput: false});
    });
  }

  linkDataset = (dataset) => {
    this.props.linkDataset(dataset);
  }

  sortDatasets = () => {
    const sortKey = this.state.sortKey;
    const sortedDatasets = this.props.datasets.slice();
    const reverseSort = sortKey.indexOf('-') === 0;

    sortedDatasets.sort((a, b) => {
      if (sortKey.indexOf('title') >= 0) {
        if (a.title < b.title) {
          return reverseSort ?  1 : -1;
        } else if (a.title > b.title) {
          return reverseSort ? -1 : 1;
        }
        return 0;
      } else {
        let dateA, dateB;
        if (sortKey.indexOf('updated') >= 0) {
          dateA = new Date(a.updated);
          dateB = new Date(b.updated);
        } else {
          dateA = new Date(a.created);
          dateB = new Date(b.created);
        }
        return reverseSort ? dateA - dateB : dateB - dateA;
      }
    });
    return sortedDatasets;
  }

  sortChanged = (sortKey) => {
    this.setState({sortKey})
  }

  datasetMenuOptionChange = () => {
    this.props.unlinkDataset();
  }

  render () {
    const { showFileInput, sortKey } = this.state;
    const { dataset, datasets, bindings, removeBinding } = this.props;

    let bindingEntries;
    if (dataset) {
      bindingEntries = dataset.files.map((file) => {
        return (<BindingListItem binding={bindings[0]} file={file}
          getFilename={this.getFilenameFromBinding} 
          removeBinding={removeBinding} />);
      });
    }
    const sortedDatasets = this.sortDatasets();

    const datasetEntries = sortedDatasets.map((d) =>{
      return (<div className='dataset' key={`${d.owner}/${d.id}`}>
        <DatasetSchema />
        <div className='center-info'>
          <div className='title'>{d.title}</div>
          <div className='info'>@{d.owner} &middot; Updated <FormattedDate value={d.updated} year='numeric' month='short' day='2-digit' /></div>
        </div>
        <Button
          bsSize='small'
          onClick={() => this.linkDataset(d)}>Link</Button>
      </div>)
    });

    return (
      <Grid className='bindings-page'>
        {!dataset && <div className='dataset-selector'>
          <Row className='center-block dataset-header'>
            <div className='title'>
              Select a dataset to link
              <Glyphicon className='add-dataset-button' glyph='plus' onClick={this.props.createDataset}/>
            </div>
          </Row>
          {!!datasets.length && 
            <Row className='center-block'>
              <div className='dataset-info'>
                {datasets.length} datasets
                <div className='pull-right'>
                  <DropdownButton title='Sort' pullRight bsSize='small' onSelect={this.sortChanged} id='dropdown-sort-datasets'>
                    <MenuItem eventKey='updated' active={sortKey === 'updated'}>Updated: Newest</MenuItem>
                    <MenuItem eventKey='-updated' active={sortKey === '-updated'}>Updated: Oldest</MenuItem>
                    <MenuItem eventKey='created' active={sortKey === 'created'}>Created: Newest</MenuItem>
                    <MenuItem eventKey='-created' active={sortKey === '-created'}>Created: Oldest</MenuItem>
                    <MenuItem eventKey='title' active={sortKey === 'title'}>Name: A - Z</MenuItem>
                    <MenuItem eventKey='-title' active={sortKey === '-title'}>Name: Z - A</MenuItem>
                  </DropdownButton>
                </div>
              </div>
              <div>
                {datasetEntries}
                <Button className='bottom-button' onClick={this.props.createDataset}>Create a new dataset</Button>
              </div>
            </Row>}
          {!datasets.length && 
            <Row className='center-block no-datasets'>
              <div className='message'>
                You haven't created any datasets to link data to.
              </div>
              <Button className='bottom-button' bsStyle='primary' onClick={this.props.createDataset}>Create a new dataset</Button>
            </Row>
          }
        </div>}
        {dataset && <div>
          <Row className='center-block dataset-header'>
            <div className='title'>
              {dataset.title}
              <Dropdown id='dropdown-dataset-options' className='pull-right' pullRight>
                <Dropdown.Toggle noCaret >
                  <Glyphicon glyph='option-vertical' />
                </Dropdown.Toggle>
                <Dropdown.Menu pullRight bsSize='small' onSelect={this.datasetMenuOptionChange}>
                  <MenuItem eventKey='unlink'>Unlink</MenuItem>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className='dataset-link'>
              <a href={`https://data.world/${dataset.owner}/${dataset.id}`}>https://data.world/{dataset.owner}/{dataset.id}</a>
            </div>
            <div className='button-group'>
              <Button onClick={this.addFile}
                disabled={showFileInput}>
                <Glyphicon glyph='plus' />
                Add File
              </Button>
              <Button onClick={this.props.sync} disabled={!bindingEntries.length}>
                <Glyphicon glyph='refresh' />
                Sync Now
              </Button>
            </div>
            
          </Row>
          {!!bindingEntries.length && <Row className='center-block'>
              <div>
                {bindingEntries}
                {showFileInput && <FileInput createBinding={this.createBinding} />}
              </div>
              
          </Row>}
          {!bindingEntries.length && 
            <Row className='center-block no-datasets'>
              <div className='message'>
                You haven't added any data to this dataset.
              </div>
              <Button className='bottom-button' bsStyle='primary' onClick={this.addFile}>Add data</Button>
            </Row>}
        </div>}
      </Grid>
    );
  }
}

export default BindingsPage;