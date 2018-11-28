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

import RecentItem from './RecentItem';
import './RecentImports.css';

export default class RecentImports extends Component {
  render() {
    const { recentImports } = this.props;
    let previousDate = '';
    let showDate;

    return (
      <div>
        <div className="recents-header">
          <ControlLabel className="recents-header-text">
            Recent Imports
          </ControlLabel>
          <Button
            bsStyle="default"
            className="recents-header-button"
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
        </div>
      </div>
    );
  }
}
