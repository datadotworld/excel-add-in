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
import './CreateItemModal.css';

import analytics from '../analytics';

class CreateItemModal extends Component {
  static propTypes = {
    close: PropTypes.func,
    createDataset: PropTypes.func,
    user: PropTypes.object
  };

  state = {
    isSubmitting: false,
    title: '',
    visibility: 'PRIVATE',
    objective: ''
  };

  submit = async (event) => {
    analytics.track(`exceladdin.create_${this.props.itemType}.submit.click`);
    event.preventDefault();
    this.setState({ isSubmitting: true });
    const item = {
      title: this.state.title,
      visibility: this.state.visibility,
      objective: this.state.objective,
      type: this.props.itemType
    };

    try {
      const createdItem = await this.props.createItem(item);
      this.props.selectItem(createdItem.uri);
      this.props.close();
      this.setState({ isSubmitting: false });
    } catch (error) {
      this.setState({ isSubmitting: false });
    }
  };

  isItemValid = () => {
    const { title } = this.state;
    return title && title.length > 3 && title.length <= 60;
  };

  visibilityChanged = (event) => {
    analytics.track(
      `exceladdin.create_${this.props.itemType}.visibility.change`,
      {
        visibility: event.target.value
      }
    );
    this.setState({ visibility: event.target.value });
  };

  closeClicked = () => {
    analytics.track(`exceladdin.create_${this.props.itemType}.close.click`);
    this.props.close();
  };

  cancelClicked = () => {
    analytics.track(
      `exceladdin.create_${this.props.itemType}.cancel_button.click`
    );
    this.props.close();
  };

  render() {
    const { user, itemType } = this.props;
    const { title, visibility, objective } = this.state;
    let itemValidState;

    if (title) {
      itemValidState = this.isItemValid() ? 'success' : 'warning';
    }

    return (
      <Grid className="create-item-modal full-screen-modal show">
        <Row className="center-block header">
          <div className="title">
            {`Create a new ${itemType}`}
            <Icon
              icon="close"
              className="close-button"
              onClick={this.closeClicked}
            />
          </div>
        </Row>

        <Row className="center-block">
          <form onSubmit={this.submit}>
            <FormGroup validationState={itemValidState}>
              <ControlLabel className="item-title">{`${
                this.props.itemType
              } title`}</ControlLabel>
              <InputGroup>
                <FormControl
                  onChange={(event) =>
                    this.setState({ title: event.target.value })
                  }
                  value={title}
                  autoFocus
                  type="text"
                />
              </InputGroup>
              <HelpBlock>
                {`This will also be your ${itemType} URL: https://data.world/${
                  user.id
                }/`}
                <strong>
                  {title ? kebabCase(title) : `cool-new-${itemType}`}
                </strong>
                <div className="titleLimit">max. 60</div>
              </HelpBlock>
            </FormGroup>
            {itemType === 'project' && (
              <FormGroup>
                <ControlLabel className="item-title">
                  Project objective{' '}
                  <span className="item-form-info">(optional)</span>
                </ControlLabel>
                <InputGroup>
                  <FormControl
                    onChange={(event) =>
                      this.setState({ objective: event.target.value })
                    }
                    value={objective}
                    name="objective"
                    componentClass="textarea"
                    type="textarea"
                  />
                </InputGroup>
                <HelpBlock>
                  <div className="titleLimit">max. 120</div>
                </HelpBlock>
              </FormGroup>
            )}
            <FormGroup>
              <Radio
                name="privacy"
                onChange={this.visibilityChanged}
                checked={visibility === 'PRIVATE'}
                className={visibility === 'PRIVATE' ? 'checked' : ''}
                value="PRIVATE"
              >
                <div className="radio-label">
                  Private <Glyphicon glyph="lock" />
                </div>
                <div className="radio-option-description">
                  Will only be shared with others you invite.
                </div>
              </Radio>
              <Radio
                name="privacy"
                onChange={this.visibilityChanged}
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
            </FormGroup>
            <div className="button-group">
              <Button onClick={this.cancelClicked}>Cancel</Button>
              <Button
                className="create-button"
                type="submit"
                disabled={
                  this.state.isSubmitting || itemValidState !== 'success'
                }
                bsStyle="primary"
              >
                {`Create ${itemType}`}
              </Button>
            </div>
          </form>
        </Row>
      </Grid>
    );
  }
}

export default CreateItemModal;
