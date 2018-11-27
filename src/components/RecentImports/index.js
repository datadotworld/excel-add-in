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

import { Button, ControlLabel } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { getDestination } from '../../util';
import './RecentImports.css';

class RecentItem extends Component {
  state = {
    loading: false
  };

  import = async () => {
    this.setState({ loading: true });
    const { sheetName, itemUrl, isQuery, table } = this.props;

    try {
      await this.props.import(sheetName, itemUrl, isQuery, table);
      this.setState({ loading: false });
    } catch (importError) {
      this.props.setError(importError);
    }
  };

  render() {
    const { itemUrl, table, isQuery, sheetName } = this.props;
    const { loading } = this.state;
    const destination = getDestination(itemUrl);

    return (
      <div className="recent-import-item">
        <div className="recent-item-text">
          <div className="recent-item-from">
            <span className="recent-text-title">From:</span>
            {` ${destination.owner}/${destination.id} ${table.name} (${
              isQuery ? 'query' : 'table'
            })`}
          </div>
          <div className="recent-item-to">
            <span className="recent-text-title">To:</span>
            {` ${sheetName}`}
          </div>
        </div>
        {loading && (
          <div className="loader-container">
            <div className="loader-icon" />
          </div>
        )}
        {!loading && (
          <div
            className="recent-item-image"
            onClick={() => {
              this.import();
            }}
            title="Repeat import"
          >
            <FontAwesomeIcon icon={faArrowDown} size="2x" color="white" />
          </div>
        )}
      </div>
    );
  }
}

export default class RecentImports extends Component {
  render() {
    const { recentImports } = this.props;
    let previousDate = '';
    let showDate;

    return (
      <div>
        <div className="full-screen-modal category-title">
          <ControlLabel className="large-header">Recent Imports</ControlLabel>
          <Button
            bsStyle="link"
            className="upload-button"
            onClick={this.props.close}
          >
            + New import
          </Button>
        </div>

        <div className="recent-items">
          {recentImports.map((recentItem) => {
            const dateArray = new Date(recentItem.date)
              .toDateString()
              .split(' ');
            let dateToShow = dateArray[1] + ' ' + dateArray[2];
            if (dateToShow !== previousDate) {
              previousDate = dateToShow;
              showDate = true;
            } else {
              showDate = false;
            }
            return (
              <div key={recentItem.date}>
                {showDate && <div className="recents-date">{dateToShow}</div>}
                <RecentItem
                  itemUrl={recentItem.itemUrl}
                  table={recentItem.table}
                  isQuery={recentItem.isQuery}
                  sheetName={recentItem.sheetName}
                  setError={this.props.setError}
                  import={this.props.import}
                />
              </div>
            );
          })}

          <div className="category-reminder">
            Showing {recentImports.length} most recent imports
          </div>
        </div>
      </div>
    );
  }
}
