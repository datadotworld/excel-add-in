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
import { 
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Grid,
  InputGroup,
  Row
} from 'react-bootstrap';

import './UploadInsight.css';


class UploadInsight extends Component {
  render() {
    return (
      <Grid>
        <Row >
          <div className="insight-upload">
            <img
              className="insight-selected"
              src={`data:image/png;base64, ${this.props.chart}`}
              alt="chart"
            />
            <FormGroup>
              <ControlLabel className="insight-label">Project</ControlLabel>
              <InputGroup>
                <FormControl
                  type='text' />
              </InputGroup>
              <ControlLabel className="insight-label">Title <span className='info'>Max. 60</span></ControlLabel>
              <InputGroup>
                <FormControl
                  type='text' />
              </InputGroup>
              <ControlLabel className="insight-label">Add Comment <span className="info">Optional</span></ControlLabel>
              <InputGroup>
                <FormControl
                  componentClass="textarea"
                  type='textarea' />
              </InputGroup>
            </FormGroup>
            <div className='insight-upload-buttons'>
              <Button
                className="insight-upload-button"
              >
                Cancel
              </Button>
              <Button
                className="insight-upload-button"
                bsStyle='primary'>OK</Button>
            </div>
          </div>
        </Row>
      </Grid>
    );
  }
}

export default UploadInsight;
