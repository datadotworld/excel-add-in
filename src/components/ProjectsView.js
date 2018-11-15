/*
 * Copyright 2018 data.world, Inc.
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

class LibraryView extends Component {
  static propTypes = {
    createDataset: PropTypes.func,
    datasets: PropTypes.array,
    selectDataset: PropTypes.func,
    loadingProjects: PropTypes.bool
  };

  static defaultProps = {
    datasets: [],
    loadingProjects: true
  };

  state = {
    sortKey: 'updated'
  };

  componentDidMount() {
    this.props.getProjects();
  }

  render() {
    const {
      projects,
      loadingProjects,
      toggleShowCreateProject,
      handleUrlChange
    } = this.props;
    const projectEntries = projects.map((project) => {
      return (
        <LibraryItem
          dataset={{ ...project, isProject: true }}
          key={`${project.owner}/${project.id}`}
          buttonText="Link"
          buttonHandler={handleUrlChange}
        />
      );
    });

    return (
      <Grid className="datasets-view">
        <div className="dataset-selector">
          <Row className="center-block section-header">
            <ControlLabel>Select a project</ControlLabel>
            <Button
              bsStyle="default"
              onClick={() => this.props.toggleShowProjects()}
            >
              Cancel
            </Button>
          </Row>
          {loadingProjects && <LoadingAnimation label="Fetching projects..." />}
          {!!projects.length && !loadingProjects && (
            <Row className="center-block">
              <div>
                <LibraryItem
                  buttonText="Link"
                  dataset={{ isCreate: true, isProject: true }}
                  buttonHandler={toggleShowCreateProject}
                />
                {projectEntries}
              </div>
            </Row>
          )}
          {!projects.length && !loadingProjects && (
            <Row className="center-block no-datasets">
              <div className="message">
                You haven't created any projects to upload the insight to.
              </div>
              <Button
                className="bottom-button"
                bsStyle="primary"
                onClick={toggleShowCreateProject}
              >
                Create a new project
              </Button>
            </Row>
          )}
        </div>
      </Grid>
    );
  }
}

export default LibraryView;
