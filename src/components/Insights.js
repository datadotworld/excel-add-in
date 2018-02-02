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
import { Grid, Row } from 'react-bootstrap';
import Icon from './icons/Icon';
import Charts from './Charts';
import UploadInsight from './UploadInsight'
import analytics from '../analytics';

import './Insights.css';


class Insights extends Component {
  constructor() {
    super();

    this.state = {selectedChart: ''}
  }

  closeClicked = () => {
    analytics.track('exceladdin.add_insight.close.click');
    window.location.pathname = '/';
  }

  selectChart= (chart) => {
    this.setState({selectedChart: chart});
  }

  render() {
    const { selectedChart } = this.state;
    return (
      <Grid className="insights">
        <Row className='center-block section-header insight-header'>
          <div className='insight-title'>
            New Insight
            <Icon icon='close' className='close-button' onClick={this.closeClicked}/>
          </div>
        </Row>
        {!selectedChart && <Charts
            charts={this.props.charts}
            getImage={this.props.getImage}
            selectChart={this.selectChart}
          />}
        {selectedChart && <UploadInsight
          getImage={this.props.getImage}
          chart={selectedChart}
          uploadChart={this.props.uploadChart}
          />}
      </Grid>
    );
  }
}

export default Insights;
