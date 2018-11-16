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
import { Grid } from 'react-bootstrap';
import Charts from './Charts';
import UploadInsight from './UploadInsight';
import LibraryView from './LibraryView';
import CreateItemModal from './CreateItemModal';

import './Insights.css';

class Insights extends Component {
  static propTypes = {
    user: PropTypes.object,
    getImageAndTitle: PropTypes.func,
    charts: PropTypes.array,
    officeInitialized: PropTypes.bool,
    projects: PropTypes.array,
    createProject: PropTypes.func,
    uploadChart: PropTypes.func,
    initializeInsights: PropTypes.func
  };

  state = {
    selectedChart: '',
    showProjects: false,
    showCreateProject: false,
    projectUrl: ''
  };

  selectChart = (imageString, title) => {
    this.setState({ selectedChart: { imageString, title } });
  };

  toggleShowProjects = () => {
    this.setState({ showProjects: !this.state.showProjects });
  };

  toggleShowCreateProject = () => {
    this.setState({ showCreateProject: !this.state.showCreateProject });
  };

  selectProject = (url) => {
    this.setState({ projectUrl: url });
    if (this.state.showProjects) {
      this.toggleShowProjects();
    }
  };

  render() {
    const {
      selectedChart,
      showProjects,
      showCreateProject,
      projectUrl
    } = this.state;
    const {
      charts,
      getImageAndTitle,
      uploadChart,
      user,
      createProject,
      officeInitialized,
      setError,
      setErrorMessage,
      getProjects,
      loadingProjects
    } = this.props;

    if (officeInitialized) {
      return (
        <Grid className="insights-container">
          {!selectedChart && (
            <Charts
              charts={charts}
              getImageAndTitle={getImageAndTitle}
              createProject={createProject}
              selectChart={this.selectChart}
              setError={setError}
            />
          )}

          {selectedChart && !showProjects && (
            <UploadInsight
              getImageAndTitle={getImageAndTitle}
              chart={selectedChart.imageString}
              title={selectedChart.title}
              uploadChart={uploadChart}
              setError={setError}
              setErrorMessage={setErrorMessage}
              toggleShowProjects={this.toggleShowProjects}
              projectUrl={projectUrl}
              handleUrlChange={this.handleUrlChange}
            />
          )}

          {selectedChart && !showCreateProject && showProjects && (
            <LibraryView
              onSelect={this.handleUrlChange}
              loading={loadingProjects}
              toggleList={this.toggleShowProjects}
              toggleShowForm={this.toggleShowCreateProject}
              getItems={getProjects}
              isProjects
            />
          )}

          {selectedChart && showCreateProject && (
            <CreateItemModal
              user={user}
              createItem={createProject}
              close={() => this.setState({ showCreateProject: false })}
              selectItem={this.selectProject}
              showItems={this.toggleShowDatasets}
              itemType="project"
            />
          )}
        </Grid>
      );
    } else {
      return <div />;
    }
  }
}

export default Insights;
