import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { 
  Button,
  Dropdown,
  DropdownButton,
  Glyphicon,
  Grid,
  MenuItem,
  Row
} from 'react-bootstrap';

import './BindingsPage.css';
import BindingListItem from './BindingListItem';
import Icon from './icons/Icon'
import FileInput from './FileInput';

class BindingsPage extends Component {

  static propTypes = {
    addBindingToExistingFile: PropTypes.func,
    bindings: PropTypes.array,
    createBinding: PropTypes.func,
    dataset: PropTypes.object,
    loggedIn: PropTypes.bool,
    removeBinding: PropTypes.func,
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

  datasetMenuOptionChange = () => {
    this.props.unlinkDataset();
  }

  sortFiles = () => {
    const sortKey = this.state.sortKey;
    const sortedFiles = this.props.dataset.files.slice();
    const reverseSort = sortKey.indexOf('-') === 0;

    sortedFiles.sort((a, b) => {
      if (sortKey.indexOf('name') >= 0) {
        if (a.name < b.name) {
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
    return sortedFiles;
  }

  sortChanged = (sortKey) => {
    this.setState({sortKey})
  }

  addBindingToExistingFile = (file) => {
    this.props.createBinding(file.name);
  }

  findBindingForFile = (file) => {
    console.log(this.props.bindings);
    return this.props.bindings.find((binding) => {
      return binding.id === `dw::${file.name}`;
    });
  }

  render () {
    const { showFileInput, sortKey } = this.state;
    const { dataset, bindings, removeBinding } = this.props;

    let bindingEntries;
    if (dataset && dataset.files.length) {
      const sortedFiles = this.sortFiles();
      
      bindingEntries = sortedFiles.map((file) => {
        const binding = this.findBindingForFile(file);
        console.log(binding);
        return (<BindingListItem binding={binding} file={file}
          addBinding={this.addBindingToExistingFile}
          removeBinding={removeBinding} />);
      });
    }

    return (
      <Grid className='bindings-page'>
        <Row className='center-block section-header'>
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
            <a href={`https://data.world/${dataset.owner}/${dataset.id}`} target='_blank'>https://data.world/{dataset.owner}/{dataset.id}</a>
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
        {!!bindingEntries.length && 
          <Row className='center-block'>
            <div className='list-info'>
              {dataset.files.length} files
              <div className='pull-right sort-dropdown'>
                <DropdownButton title='Sort' pullRight bsSize='small' onSelect={this.sortChanged} id='dropdown-sort-files'>
                  <MenuItem eventKey='updated' active={sortKey === 'updated'}><Icon icon='check' />Updated: Newest</MenuItem>
                  <MenuItem eventKey='-updated' active={sortKey === '-updated'}><Icon icon='check' />Updated: Oldest</MenuItem>
                  <MenuItem eventKey='created' active={sortKey === 'created'}><Icon icon='check' />Created: Newest</MenuItem>
                  <MenuItem eventKey='-created' active={sortKey === '-created'}><Icon icon='check' />Created: Oldest</MenuItem>
                  <MenuItem eventKey='name' active={sortKey === 'name'}><Icon icon='check' />Name: A - Z</MenuItem>
                  <MenuItem eventKey='-name' active={sortKey === '-name'}><Icon icon='check' />Name: Z - A</MenuItem>
                </DropdownButton>
              </div>
            </div>
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
      </Grid>
    );
  }
}

export default BindingsPage;