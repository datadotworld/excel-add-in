import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {FormattedDate} from 'react-intl';

import { 
  Button,
  DropdownButton,
  Glyphicon,
  Grid,
  MenuItem,
  Row
} from 'react-bootstrap';

import './DatasetsView.css';
import DatasetSchema from './icons/DatasetSchema';

class DatasetsView extends Component {

  static propTypes = {
    createDataset: PropTypes.func,
    datasets: PropTypes.array,
    linkDataset: PropTypes.func
  }

  state = {
    sortKey: 'updated'
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

  linkDataset = (dataset) => {
    this.props.linkDataset(dataset);
  }


  render () {
    const { sortKey } = this.state;
    const { datasets } = this.props;
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
      <Grid className='datasets-view'>
        <div className='dataset-selector'>
          <Row className='center-block section-header'>
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
        </div>
      </Grid>
    );
  }
}

export default DatasetsView;