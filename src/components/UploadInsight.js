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
import analytics from '../analytics';


class UploadInsight extends Component {
  static propTypes = {
    getImageAndTitle: PropTypes.func,
    chart: PropTypes.string,
    title: PropTypes.string,
    uri: PropTypes.string,
    uploadChart: PropTypes.func,
    projects: PropTypes.array
  }

  state = {
    title: this.props.title || '',
    project: this.props.projects[0],
    description: '',
    uploadComplete: false,
    uri: ''
  }

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({ [name]: value});
  }

  onSelect = (eventKey) => {
    const projects = this.props.projects;
    const selected = {
      owner: projects[eventKey].owner,
      id: projects[eventKey].id,
      title: projects[eventKey].title
    };

    this.setState({ project: selected });
  }

  upload = () => {
    analytics.track('exceladdin.create_project.ok.click');
    const { chart } = this.props;
    const { title, project, description } = this.state;
    this.props.uploadChart(chart, { title, project, description }).then(res => {
      this.setState({ uploadComplete: true, uri: res });
    });
  }

  closeClicked = () => {
    analytics.track('exceladdin.upload_insight.close.click');
    window.location.pathname = '/insights';
  }

  render() {
    const { uploadComplete, title, project, uri } = this.state;
    const { chart } = this.props;
    return (
      <Row className="upload-row">
        {!uploadComplete && <div className="insight-upload">
          <img
            className="insight-selected"
            src={`data:image/png;base64, ${chart}`}
            alt="chart"
          />
          <FormGroup>
            <ControlLabel className="insight-label">Project</ControlLabel>
            <DropdownButton
              id="projects-dropdown"
              className="projects"
              title={`${project.owner}/${project.title}`}
              onSelect={this.onSelect}
            >
              {
                this.props.projects.map((project, index) => {
                  return <MenuItem eventKey={index} key={index}>{`${project.owner}/${project.title}`}</MenuItem>
                })
              }
            </DropdownButton>
          </FormGroup>
          <FormGroup validationState={this.state.title.length > 60 ? 'error' : null}>
            <ControlLabel className="insight-label">
              Title <span className='insight-info'>Max. 60</span>
            </ControlLabel>
            <InputGroup>
              <FormControl
                onChange={this.handleChange}
                name='title'
                value={title}
                type='text' />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <ControlLabel className="insight-label">
              Add Comment <span className="insight-info">Optional</span>
            </ControlLabel>
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
              onClick={this.closeClicked}
              className="insight-upload-button"
            >
              Cancel
            </Button>
            <Button
              className="insight-upload-button"
              onClick={this.upload}
              disabled={!title || title.length > 60}
              bsStyle='primary'
            >
              OK
            </Button>
          </div>
        </div>}
        {uploadComplete && <Published chart={chart} uri={uri} title={title} />}
      </Row>
    );
  }
}

export default UploadInsight;
