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
  InputGroup,
  Row,
  DropdownButton,
  MenuItem
} from 'react-bootstrap';
import Published from './Published';

import './UploadInsight.css';


class UploadInsight extends Component {
  constructor(props) {
    super();

    this.state = {
      title: '',
      project: props.projects[0].id,
      description: '',
      uploadComplete: false,
      uri: ''
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({ [name]: value})
  }

  onSelect = (eventKey) => {
    const value = this.props.projects[eventKey].id;

    this.setState({ project: value})
  }

  upload = () => {
    const { chart, user } = this.props;
    const { title, project, description } = this.state;
    this.props.uploadChart(chart, { title, project, description, user }).then(res => {
      this.setState({ uploadComplete: true, uri: res })
    });
  }

  close = () => {
    window.location.pathname = '/insights'
  }

  render() {
    const { uploadComplete, title } = this.state;
    return (
      <Row className="upload-row">
        {!uploadComplete && <div className="insight-upload">
          <img
            className="insight-selected"
            src={`data:image/png;base64, ${this.props.chart}`}
            alt="chart"
          />
          <FormGroup>
            <ControlLabel className="insight-label">Project</ControlLabel>
            <DropdownButton
              id="projects-dropdown"
              className="projects"
              title={this.state.project}
              onSelect={this.onSelect}
            >
              {
                this.props.projects.map((project, index) => {
                  return <MenuItem eventKey={index}>{project.id}</MenuItem>
                })
              }
            </DropdownButton>
            </FormGroup>
            <FormGroup validationState={this.state.title.length > 60 ? 'error' : null}>
            <ControlLabel className="insight-label">Title <span className='info'>Max. 60</span></ControlLabel>
            <InputGroup>
              <FormControl
                onChange={this.handleChange}
                name='title'
                value={this.state.title}
                type='text' />
            </InputGroup>
            </FormGroup>
            <FormGroup>
            <ControlLabel className="insight-label">Add Comment <span className="info">Optional</span></ControlLabel>
            <InputGroup>
              <FormControl
                onChange={this.handleChange}
                name='description'
                value={this.state.description}
                componentClass="textarea"
                type='textarea' />
            </InputGroup>
          </FormGroup>
          <div className='insight-upload-buttons'>
            <Button
              onClick={this.close}
              className="insight-upload-button"
            >
              Cancel
            </Button>
            <Button
              className="insight-upload-button"
              onClick={this.upload}
              disabled={!title || title.length > 60}
              bsStyle='primary'>OK</Button>
          </div>
        </div>}
        {uploadComplete && <Published chart={this.props.chart} uri={this.state.uri} />}
      </Row>
    );
  }
}

export default UploadInsight;
