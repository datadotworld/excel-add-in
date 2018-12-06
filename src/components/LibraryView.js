/*
 * Copyright 2017 data.world, Inc.
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

import { Button, Grid, Row, ControlLabel } from 'react-bootstrap';
import './LibraryView.css';
import LibraryItem from './LibraryItem';
import LoadingAnimation from './LoadingAnimation';
import { sortByOwnerAndTitle } from '../util';

class LibraryView extends Component {
  static propTypes = {
    onSelect: PropTypes.func,
    loading: PropTypes.bool,
    toggleList: PropTypes.func,
    toggleShowForm: PropTypes.func,
    getItems: PropTypes.func
  };

  state = {
    items: []
  };

  componentDidMount() {
    const { writeAccess } = this.props;
    this.props.getItems(writeAccess).then((items) => {
      this.setState({ items });
    });
  }

  render() {
    const {
      loading,
      toggleShowForm,
      toggleList,
      onSelect,
      isProjects
    } = this.props;
    const { items } = this.state;

    const sortedItems = sortByOwnerAndTitle(items);
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
      <Grid className="items-view">
        <div className="item-selector">
          <Row className="center-block section-header">
            <ControlLabel>{`Select a ${
              isProjects ? 'project' : 'dataset or project'
            }`}</ControlLabel>
            <Button bsStyle="default" onClick={() => toggleList()}>
              Cancel
            </Button>
          </Row>
          {loading && <LoadingAnimation label="Fetching items..." />}
          {!!items.length && !loading && (
            <Row className="center-block">
              <div>
                <LibraryItem
                  buttonText="Link"
                  item={{ isCreate: true }}
                  buttonHandler={toggleShowForm}
                  isProject={isProjects}
                />
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

export default LibraryView;
