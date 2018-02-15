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
import LoadingAnimation from './LoadingAnimation';

import './Chart.css';

class Chart extends Component {
  static propTypes = {
    chart: PropTypes.object,
    key: PropTypes.number,
    getImageAndTitle: PropTypes.func,
    selectChart: PropTypes.func
  }

  state = {
    imageString: '',
    title: ''
  }
  
  componentWillMount() {
    const { sheet, chartName } = this.props.chart
    this.props.getImageAndTitle(sheet, chartName).then(res => {
      this.setState({ imageString: res.image, title: res.title });
    });
  }

  selectChart = () => {
    this.props.selectChart(this.state.imageString, this.state.title);
  }
  
  render() {
    if (this.state.imageString) {
      return <img
        className="insight-chart"
        src={`data:image/png;base64, ${this.state.imageString}`}
        alt="chart"
        onClick={this.selectChart}
      />
    } else {
      return <LoadingAnimation />
    }
  }
}

export default Chart;
