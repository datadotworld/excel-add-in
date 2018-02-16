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
import { Row, Button, Alert } from 'react-bootstrap';
import Chart from './Chart';
import NoChart from './NoChart';
import NoProjects from './NoProjects';
import CreateProject from './CreateProjectModal';

import './Charts.css';
import analytics from '../analytics';

class Charts extends Component {
  static propTypes = {
    charts: PropTypes.array,
    projects: PropTypes.array,
    getImageAndTitle: PropTypes.func,
    createProject: PropTypes.func,
    user: PropTypes.object,
    selectChart: PropTypes.func,
    setError: PropTypes.func
  }

  state = {
    showAddProject: false,
    failedToLoad: 0
  }

  showAddProject = () => {
    this.setState({ showAddProject: true });
  }

  closeAddProject = () => {
    this.setState({ showAddProject: false });
  }

  incrementFailed = () => {
    const { failedToLoad } = this.state;
    this.setState({ failedToLoad: failedToLoad + 1 });
  }

  refresh = () => {
    analytics.track('exceladdin.charts.refresh_button.click');
    window.location.pathname = '/insights'
  }

  render() {
    const {
      charts,
      projects,
      getImageAndTitle,
      selectChart,
      user,
      createProject,
      setError
    } = this.props;
    const { showAddProject, failedToLoad } = this.state;

    const loadCharts = charts.length > 0;
    const loadProjects = projects.length > 0;

    let errorMessage;
    if (charts.length > 1) {
      errorMessage = failedToLoad > 1 ?
        `${failedToLoad} additional charts were detected but cannot be displayed. To use them in insights, try changing their chart type.` :
        `1 additional chart was detected but cannot be displayed. To use it in insights, try changing its chart type.`;
    } else {
      errorMessage = `${failedToLoad} chart was detected but cannot be displayed. To use it in insights, try changing its chart type.`;
    }

    return (
      <Row className="charts-container">
        {loadProjects && loadCharts && <div className="container">
          <div className='insight-sub-header'>
            Pick a chart
          </div>
          <div className="insight-charts">
            {
              charts.map((chart, index) => {
                return <Chart
                  key={index}
                  chart={chart}
                  getImageAndTitle={getImageAndTitle}
                  selectChart={selectChart}
                  incrementFailed={this.incrementFailed}
                />
              })
            }
          </div>
          {failedToLoad > 0 && <Alert bsStyle="danger" className="charts-failed">
            {errorMessage}
          </Alert>}
          <div className="insight-button-container">
            <Button
              onClick={this.refresh}
              bsStyle="primary"
              className="refresh-button"
            >
              Refresh
            </Button>
          </div>
        </div>}
        {!loadProjects && !showAddProject && <NoProjects showAddProject={this.showAddProject} />}
        {loadProjects && !loadCharts && <NoChart />}
        {showAddProject && <CreateProject
          user={user}
          close={this.closeAddProject}
          createProject={createProject}
          setError={setError}
        />}
      </Row>
    );
  }
}

export default Charts;
