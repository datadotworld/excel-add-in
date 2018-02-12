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
import Charts from './Charts';
import UploadInsight from './UploadInsight';

import './Insights.css';


class Insights extends Component {
  constructor() {
    super();

    this.state = { selectedChart: '' };
  }

  selectChart= (imageString, title) => {
    this.setState({ selectedChart: { imageString, title } });
  }

  render() {
    const { selectedChart } = this.state;
    const { charts, getImage, uploadChart, projects, user, createProject } = this.props;
    return (
      <Grid className="insights-container">
        <Row className='center-block section-header insight-header'>
          <div className='insight-title'>
            New Insight
          </div>
        </Row>
        {!selectedChart && <Charts
          charts={charts}
          projects={projects}
          getImage={getImage}
          user={user}
          createProject={createProject}
          selectChart={this.selectChart}
        />}
        {selectedChart && <UploadInsight
          getImage={getImage}
          chart={selectedChart.imageString}
          title={selectedChart.title}
          uploadChart={uploadChart}
          projects={projects}
        />}
      </Grid>
    );
  }
}

export default Insights;
