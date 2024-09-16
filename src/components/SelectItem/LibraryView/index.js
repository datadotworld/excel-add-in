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

  sortItems = () => {
    const sortedItems = this.props.items.slice();

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
      hideCreateNew,
      loading,
      items
    } = this.props;

    const sortedItems = this.sortItems(items);
    const entries = sortedItems.map((item) => {
      const isProject = item.category === 'project' || isProjects;

      return (
        <LibraryItem
          item={item}
          key={`${item.owner}/${item.id}`}
          buttonText="Link"
          buttonHandler={onSelect}
          isProject={isProject}
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
               No results found, please refine your search.
             </div>
           </Row>
          )}
        </div>
      </Grid>
    );
  }
}
