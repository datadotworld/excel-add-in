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
  FormGroup,
} from 'react-bootstrap';

import LibraryView from './LibraryView';

import './SelectItem.css';

export default class UploadModal extends Component {
  state = {
    showLibrary: false,
    items: [],
    loading: true
  };

  handleBrowseClick = () => {
    const { getItems, query, owner } = this.props;

    this.setState({ loading: true });

    if (!query || !owner) {
      this.setState({ loading: false });
      return;
    }

    getItems(query, owner).then((items) => {
      this.setState({ items, loading: false, showLibrary: true });
    }).catch(() => {
      this.setState({ loading: false });
    });
  };

  onSelect = (url) => {
    this.props.handleChange(url);
    this.setState({ showLibrary: false });
  };

  render() {
    const { showLibrary, items, loading } = this.state;
    const { title, query, owner, itemUrl } = this.props;

    return (
      <div>
        {!showLibrary && (
          <FormGroup>
            <Button
              bsStyle="primary"
              onClick={this.handleBrowseClick}
              disabled={!query || !owner}
            >
              Search
            </Button>

            <div>
              <ControlLabel className="select-item-title">{title}</ControlLabel>    
              {itemUrl && (
                <FormGroup>
                  Loaded: <ControlLabel>{itemUrl}</ControlLabel>
                </FormGroup>
              )}
            </div>
          </FormGroup>
        )}                  
        {showLibrary && (
          <LibraryView
            close={() => this.setState({ showLibrary: false })}
            items={items}       
            loading={loading}
            onSelect={this.onSelect}
            hideCreateNew={this.props.hideCreateNew}
          />
        )}
      </div>
    );
  }
}
