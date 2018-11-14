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
  HelpBlock
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
  };

  state = {
    title: this.props.title || '',
    description: '',
    uploadComplete: false,
    uri: ''
  };

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  };

  onSelect = (eventKey) => {
    const projects = this.props.projects;
    const selected = {
      owner: projects[eventKey].owner,
      id: projects[eventKey].id,
      title: projects[eventKey].title
    };

    this.setState({ project: selected });
  };

  upload = async () => {
    analytics.track('exceladdin.create_project.ok.click');
    const { chart } = this.props;
    const { title, description } = this.state;
    const { projectUrl } = this.props;

    const regexMatch = /https:\/\/data\.world\/([^/?#]*)\/([^/?#]*)?/;
    const matched = projectUrl.match(regexMatch);
    const owner = matched[1];
    const id = matched[2];

    const project = { owner, id };

    try {
      const res = await this.props.uploadChart(chart, {
        title,
        project,
        description
      });
      this.setState({ uploadComplete: true, uri: res });
    } catch (uploadError) {
      this.props.setError(uploadError);
    }
  };

  closeClicked = () => {
    analytics.track('exceladdin.upload_insight.close.click');
    window.location.pathname = '/insights';
  };

  formValid = () => {
    const { title } = this.state;
    const { projectUrl } = this.props;
    const titleValid = title && title.length < 60;
    const projectValid = projectUrl.length > 0;

    return titleValid && projectValid;
  };

  render() {
    const { uploadComplete, title, uri } = this.state;
    const { chart } = this.props;
    return (
      <Row className="upload-row">
        {!uploadComplete && (
          <div className="insight-upload">
            <img
              className="insight-selected"
              src={`data:image/png;base64, ${chart}`}
              alt="chart"
            />
            <FormGroup>
              <div className="body">
                <ControlLabel className="insight-label">
                  Project URL:
                </ControlLabel>
                <InputGroup>
                  <div className="url">
                    <FormControl
                      className="textField"
                      placeholder="https://data.world/"
                      value={this.props.projectUrl}
                      type="text"
                      onChange={(event) => {
                        this.props.handleUrlChange(event.target.value);
                      }}
                    />
                    <Button
                      className="browse-button"
                      onClick={() => this.props.toggleShowProjects()}
                    >
                      Browse
                    </Button>
                  </div>
                </InputGroup>
                <HelpBlock className="help-block">
                  Copy/paste the URL of a project, or click "Browse"
                </HelpBlock>
              </div>
            </FormGroup>
            <FormGroup
              validationState={this.state.title.length > 60 ? 'error' : null}
            >
              <ControlLabel className="insight-label">
                Title <span className="insight-info">Max. 60</span>
              </ControlLabel>
              <InputGroup>
                <FormControl
                  onChange={this.handleChange}
                  name="title"
                  value={title}
                  type="text"
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <ControlLabel className="insight-label">
                Add Comment <span className="insight-info">Optional</span>
              </ControlLabel>
              <InputGroup>
                <FormControl
                  onChange={this.handleChange}
                  name="description"
                  value={this.state.description}
                  componentClass="textarea"
                  type="textarea"
                />
              </InputGroup>
            </FormGroup>
            <div className="insight-upload-buttons">
              <Button
                onClick={this.closeClicked}
                className="insight-upload-button"
              >
                Cancel
              </Button>
              <Button
                className="insight-upload-button"
                onClick={this.upload}
                disabled={!this.formValid()}
                bsStyle="primary"
              >
                OK
              </Button>
            </div>
          </div>
        )}
        {uploadComplete && <Published chart={chart} uri={uri} title={title} />}
      </Row>
    );
  }
}

export default UploadInsight;
