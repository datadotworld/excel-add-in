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
import { generateChartError } from '../util';

import './Charts.css';
import analytics from '../analytics';

class Charts extends Component {
  static propTypes = {
    charts: PropTypes.array,
    getImageAndTitle: PropTypes.func,
    selectChart: PropTypes.func,
    setError: PropTypes.func
  };

  state = {
    failedToLoad: 0
  };

  incrementFailed = () => {
    const { failedToLoad } = this.state;
    this.setState({ failedToLoad: failedToLoad + 1 });
  };

  refresh = () => {
    analytics.track('exceladdin.charts.refresh_button.click');
    window.location.pathname = '/insights';
  };

  render() {
    const { charts, getImageAndTitle, selectChart } = this.props;
    const { failedToLoad } = this.state;

    const loadCharts = charts.length > 0;

    return (
      <Row className="charts-container">
        {loadCharts && (
          <div className="container">
            <div className="insight-sub-header">Pick a chart</div>
            <div className="insight-charts">
              {charts.map((chart, index) => {
                return (
                  <Chart
                    key={index}
                    chart={chart}
                    getImageAndTitle={getImageAndTitle}
                    selectChart={selectChart}
                    incrementFailed={this.incrementFailed}
                  />
                );
              })}
            </div>
            {failedToLoad > 0 && (
              <Alert bsStyle="danger" className="charts-failed">
                {generateChartError(charts, failedToLoad)}
              </Alert>
            )}
            <div className="insight-button-container">
              <Button
                onClick={this.refresh}
                bsStyle="primary"
                className="refresh-button"
              >
                Refresh
              </Button>
            </div>
          </div>
        )}
        {!loadCharts && <NoChart />}
      </Row>
    );
  }
}

export default Charts;
