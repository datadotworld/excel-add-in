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
import { Button, Grid, Row, ControlLabel } from 'react-bootstrap';
import LibraryItem from './LibraryItem';
import LoadingAnimation from '../../LoadingAnimation';

import './LibraryView.css';

export default class LibraryView extends Component {
  state = {
    items: [],
    loading: true
  };

  componentDidMount() {
    this.props.getItems().then((items) => {
      this.setState({ items, loading: false });
    });
  }

  sortItems = () => {
    const sortedItems = this.state.items.slice();

    // Sort by updated in descending order
    sortedItems.sort((a, b) => {
      const dateA = new Date(a.updated);
      const dateB = new Date(b.updated);

      if (dateA < dateB) {
        return 1;
      }
      if (dateA > dateB) {
        return -1;
      }

      return 0;
    });

    return sortedItems;
  };

  render() {
    const {
      isProjects,
      toggleShowForm,
      onSelect,
      close,
      hideCreateNew
    } = this.props;
    const { loading, items } = this.state;

    const sortedItems = this.sortItems(items);
    const entries = sortedItems.map((item) => {
      return (
        <LibraryItem
          item={item}
          key={`${item.owner}/${item.id}`}
          buttonText="Link"
          buttonHandler={onSelect}
          isProject={isProjects || item.isProject}
        />
      );
    });
    return (
      <Grid className="library-view-container">
        <div className="item-selector">
          <Row className="center-block section-header">
            <ControlLabel>{`Select a ${
              isProjects ? 'project' : 'dataset or project'
            }`}</ControlLabel>
            <Button bsStyle="default" onClick={() => close()}>
              Cancel
            </Button>
          </Row>
          {loading && <LoadingAnimation label="Fetching items..." />}
          {!!items.length && !loading && (
            <Row className="center-block">
              <div>
                {!hideCreateNew && (
                  <LibraryItem
                    buttonText="Link"
                    item={{ isCreate: true }}
                    buttonHandler={toggleShowForm}
                    isProject={isProjects}
                    close={close}
                  />
                )}
                {entries}
              </div>
            </Row>
          )}
          {!items.length && !loading && (
            <Row className="center-block no-datasets">
              <div className="message">
                {isProjects
                  ? "You haven't created any projects to upload the insight to."
                  : "You haven't created any datasets to link data to."}
              </div>
              <Button
                className="bottom-button"
                bsStyle="primary"
                onClick={toggleShowForm}
              >
                {isProjects ? 'Create a new project' : 'Create a new dataset'}
              </Button>
            </Row>
          )}
        </div>
      </Grid>
    );
  }
}
