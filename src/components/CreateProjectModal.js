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
  Glyphicon,
  Grid,
  HelpBlock,
  InputGroup,
  Radio,
  Row
} from 'react-bootstrap';
import { kebabCase } from 'lodash';

import Icon from './icons/Icon';

import './CreateProjectModal.css';
import analytics from '../analytics';

class CreateProjectModal extends Component {
  static propTypes = {
    user: PropTypes.object,
    close: PropTypes.func,
    createProject: PropTypes.func
  };

  state = {
    title: '',
    objective: '',
    visibility: 'OPEN'
  };

  closeClicked = () => {
    analytics.track('exceladdin.create_project.close.click');
    this.props.close();
  };

  cancelClicked = () => {
    analytics.track('exceladdin.create_project.cancel_button.click');
    this.props.close();
  };

  handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'VISIBILITY') {
      analytics.track('exceladdin.create_project.visibility.change', {
        visibility: value
      });
    }

    this.setState({ [name]: value });
  };

  isObjectiveValid = () => {
    const { objective } = this.state;

    return objective.length <= 120;
  };

  isTitleValid = () => {
    const { title } = this.state;

    return title.length >= 5 && title.length <= 60;
  };

  formValid = () => {
    return this.isTitleValid() && this.isObjectiveValid();
  };

  createProject = () => {
    analytics.track('exceladdin.create_dataset.create_button.click');
    const { title, objective, visibility } = this.state;

    this.props
      .createProject({
        title,
        objective,
        visibility
      })
      .then((res) => {
        window.location.pathname = '/insights';
      })
      .catch((error) => {
        this.props.setError(error);
      });
  };

  render() {
    const { user } = this.props;
    const { title, objective, visibility } = this.state;

    return (
      <Grid className="create-project-modal full-screen-modal show">
        <Row className="center-block header">
          <div className="title">
            Create a new project{' '}
            <Icon
              icon="close"
              className="close-button"
              onClick={this.closeClicked}
            />
          </div>
        </Row>
        <Row className="center-block create-project-form">
          <FormGroup>
            <ControlLabel>
              Project name
              <span className="project-form-info">min. 5</span>
            </ControlLabel>
            <InputGroup>
              <FormControl
                onChange={this.handleChange}
                value={title}
                name="title"
                autoFocus
                type="text"
              />
            </InputGroup>
            <HelpBlock>
              This will also be your project URL: https://data.world/
              {user.id}/
              <strong>{title ? kebabCase(title) : 'project-name'}</strong>
            </HelpBlock>
          </FormGroup>
          <FormGroup>
            <ControlLabel>
              <div>
                Project objective{' '}
                <span className="project-form-info">(optional)</span>
              </div>
              <span className="project-form-info">max. 120</span>
            </ControlLabel>
            <InputGroup>
              <FormControl
                onChange={this.handleChange}
                value={objective}
                name="objective"
                componentClass="textarea"
                type="textarea"
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Radio
              name="visibility"
              onChange={this.handleChange}
              checked={visibility === 'OPEN'}
              className={visibility === 'OPEN' ? 'checked' : ''}
              value="OPEN"
            >
              <div className="radio-label">Open</div>
              <div className="radio-option-description">
                Publicly available data that anyone can view, query, or
                download.
              </div>
            </Radio>
            <Radio
              name="visibility"
              onChange={this.handleChange}
              checked={visibility === 'PRIVATE'}
              className={visibility === 'PRIVATE' ? 'checked' : ''}
              value="PRIVATE"
            >
              <div className="radio-label">
                Private <Glyphicon glyph="lock" />
              </div>
              <div className="radio-option-description">
                Will only be shared with others you invite. Use for personal or
                sensitive information.
              </div>
            </Radio>
          </FormGroup>
          <div className="insight-upload-buttons">
            <Button
              onClick={this.cancelClicked}
              className="insight-upload-button"
            >
              Cancel
            </Button>
            <Button
              className="insight-upload-button"
              onClick={this.createProject}
              disabled={!this.formValid()}
              bsStyle="primary"
            >
              Create Project
            </Button>
          </div>
        </Row>
      </Grid>
    );
  }
}

export default CreateProjectModal;
