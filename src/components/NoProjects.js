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
import { Button } from 'react-bootstrap';

import './NoChart.css';

class NoProject extends Component {
  showAddProject = () => {
    this.props.showAddProject();
  }

  render() {
    return <div className="no-chart">
      <div>Create a project for your insight.</div>
      <Button
        onClick={this.showAddProject}
        bsStyle="primary"
        className="no-chart-button"
      >
        Create Project
      </Button>
    </div>
  }
}

export default NoProject;
