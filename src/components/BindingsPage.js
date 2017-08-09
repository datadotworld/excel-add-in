import React, { Component } from 'react';
import PropTypes from 'prop-types';
//import {FormattedDate} from 'react-intl';

import { 
  Button,
  Dropdown,
  Glyphicon,
  Grid,
  MenuItem,
  Row
} from 'react-bootstrap';

import './BindingsPage.css';
import BindingListItem from './BindingListItem';
import FileInput from './FileInput';


class BindingsPage extends Component {

  static propTypes = {
    bindings: PropTypes.array,
    createBinding: PropTypes.func,
    dataset: PropTypes.object,
    loggedIn: PropTypes.bool,
    removeBinding: PropTypes.func,
    sync: PropTypes.func
  }

  state = {
    showFileInput: false
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

  render () {
    const { showFileInput } = this.state;
    const { dataset, bindings, removeBinding } = this.props;

    let bindingEntries;
    if (dataset) {
      bindingEntries = dataset.files.map((file) => {
        return (<BindingListItem binding={bindings[0]} file={file}
          getFilename={this.getFilenameFromBinding} 
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
        {!!bindingEntries.length && 
          <Row className='center-block'>
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