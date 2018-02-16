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
import { Row, Button } from 'react-bootstrap';
import Chart from './Chart';
import NoChart from './NoChart';
import NoProjects from './NoProjects';
import CreateProject from './CreateProjectModal';

import './Charts.css';

class Charts extends Component {
  static propTypes = {
    charts: PropTypes.array,
    projects: PropTypes.array,
    getImageAndTitle: PropTypes.func,
    user: PropTypes.object,
    createProject: PropTypes.func,
    selectChart: PropTypes.func
  }

  state = {
    showAddProject: false,
    failed: 0
  }

  showAddProject = () => {
    this.setState({ showAddProject: true });
  }

  closeAddProject = () => {
    this.setState({ showAddProject: false });
  }

  incrementFailed = () => {
    const { failed } = this.state;
    this.setState({ failed: failed + 1 });
  }

  render() {
    const {
      charts,
      projects,
      getImageAndTitle,
      selectChart,
      user,
      createProject,
      setPage,
      initializeInsights
    } = this.props;
    const { showAddProject, failed } = this.state;

    const loadCharts = charts.length > 0;
    const loadProjects = projects.length > 0;

    const errorMessage = failed > 1 ?
      'charts were detected but cannot be displayed. To use them in insights, try changing their chart type.' : 
      'chart was detected but cannot be displayed. To use it in insights, try changing its chart type.';

    return (
      <Row className="charts-container">
        {loadProjects && loadCharts && <div className="container">
          <div className='insight-sub-header'>
            Pick a chart
          </div>
          {failed > 0 && <div className="charts-failures">
            {
              `${failed} additional ${errorMessage}`
            }
          </div>}
          <div className="insight-charts">
            {
              charts.map((chart, index) => {
                return <Chart
                  chart={chart}
                  key={index}
                  getImageAndTitle={getImageAndTitle}
                  selectChart={selectChart}
                  incrementFailed={this.incrementFailed}
                />
              })
            }
          </div>
          <div className="insight-button-container">
            <Button
              onClick={() => {window.location.pathname = '/insights'}}
              bsStyle="primary"
            >
              Refresh
            </Button>
          </div>
        </div>}
        {!loadProjects && !showAddProject && <NoProjects showAddProject={this.showAddProject} />}
        {loadProjects && !loadCharts && <NoChart initializeInsights={initializeInsights} />}
        {showAddProject && <CreateProject
          user={user}
          close={this.closeAddProject}
          createProject={createProject}
          setPage={setPage}
        />}
      </Row>
    );
  }
}

export default Charts;
