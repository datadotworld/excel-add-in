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
  InputGroup
} from 'react-bootstrap';

import LibraryView from './LibraryView';

import './SelectItem.css';

export default class UploadModal extends Component {
  state = {
    showLibrary: false
  };

  onSelect = (url) => {
    this.props.handleChange(url);
    this.setState({ showLibrary: false });
  };

  render() {
    const { showLibrary } = this.state;
    const { title, placeholder, handleChange } = this.props;

    return (
      <div>
        {!showLibrary && (
          <FormGroup>
            <div>
              <ControlLabel className="select-item-title">{title}</ControlLabel>
              <InputGroup>
                <div className="select-item-container">
                  <FormControl
                    className="select-item-field"
                    placeholder={placeholder}
                    value={this.props.itemUrl}
                    type="text"
                    onChange={(event) => {
                      handleChange(event.target.value);
                    }}
                  />
                  <Button
                    className="select-item-button"
                    onClick={() => {
                      this.setState({ showLibrary: true });
                    }}
                  >
                    Browse
                  </Button>
                </div>
              </InputGroup>
            </div>
          </FormGroup>
        )}
        {showLibrary && (
          <LibraryView
            close={() => this.setState({ showLibrary: false })}
            getItems={this.props.getItems}
            onSelect={this.onSelect}
            hideCreateNew={this.props.hideCreateNew}
          />
        )}
      </div>
    );
  }
}
