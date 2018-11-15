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
import PropTypes from 'prop-types';

import { Button, Grid, Row, ControlLabel } from 'react-bootstrap';
import './LibraryView.css';
import LibraryItem from './LibraryItem';
import LoadingAnimation from './LoadingAnimation';
import analytics from '../analytics';

class LibraryView extends Component {
  static propTypes = {
    createDataset: PropTypes.func,
    datasets: PropTypes.array,
    selectDataset: PropTypes.func,
    loadingDatasets: PropTypes.bool
  };

  static defaultProps = {
    Libraries: [],
    loadingLibraries: true
  };

  state = {
    sortKey: 'updated'
  };

  componentDidMount() {
    this.props.getLibraries();
  }

  sortLibraries = () => {
    const sortKey = this.state.sortKey;
    const sortedLibraries = this.props.libraries.slice();
    const reverseSort = sortKey.indexOf('-') === 0;

    sortedLibraries.slice().sort((a, b) => {
      if (sortKey.indexOf('title') >= 0) {
        if (a.title < b.title) {
          return reverseSort ? 1 : -1;
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
    return sortedLibraries;
  };

  sortChanged = (sortKey) => {
    analytics.track('exceladdin.datasets.sort.change', { sort: sortKey });
    this.setState({ sortKey });
  };

  createDatasetClick = () => {
    analytics.track('exceladdin.datasets.create_dataset_button.click');
    this.props.createDataset();
  };

  addDatasetClick = () => {
    analytics.track('exceladdin.datasets.create_dataset_add.click');
    this.props.createDataset();
  };

  render() {
    const {
      libraries,
      loadingLibraries,
      toggleShowCreateLibrary,
      toggleShowLibraries,
      selectLibrary,
      isProjects
    } = this.props;

    const sortedLibraries = this.sortLibraries(libraries);
    const libraryEntries = sortedLibraries.map((library) => {
      return (
        <LibraryItem
          library={library}
          key={`${library.owner}/${library.id}`}
          buttonText="Link"
          buttonHandler={selectLibrary}
        />
      );
    });

    return (
      <Grid className="datasets-view">
        <div className="dataset-selector">
          <Row className="center-block section-header">
            <ControlLabel>{`Select a ${
              isProjects ? 'project' : 'dataset or project'
            }`}</ControlLabel>
            <Button bsStyle="default" onClick={() => toggleShowLibraries()}>
              Cancel
            </Button>
          </Row>
          {loadingLibraries && (
            <LoadingAnimation label="Fetching libraries..." />
          )}
          {!!libraries.length && !loadingLibraries && (
            <Row className="center-block">
              <div>
                <LibraryItem
                  buttonText="Link"
                  library={{ isCreate: true }}
                  buttonHandler={toggleShowCreateLibrary}
                />
                {libraryEntries}
              </div>
            </Row>
          )}
          {!libraries.length && !loadingLibraries && (
            <Row className="center-block no-datasets">
              <div className="message">
                {isProjects
                  ? "You haven't created any projects to upload the insight to."
                  : "You haven't created any datasets to link data to."}
              </div>
              <Button
                className="bottom-button"
                bsStyle="primary"
                onClick={this.toggleShowCreateLibrary}
              >
                {isProjects ? 'Create a new project' : 'Create a new dataset'}
              </Button>
            </Row>
          )}
        </div>
      </Grid>
    );
  }
}

export default LibraryView;
