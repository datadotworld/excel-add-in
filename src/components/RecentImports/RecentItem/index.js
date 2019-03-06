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
import { Glyphicon, Image, Tooltip, OverlayTrigger } from 'react-bootstrap';

import {
  getDestination,
  createItemLink,
  createWorkspaceLink
} from '../../../util';
import './RecentItem.css';

const tableIcon = require('../../icons/icon-table.svg');
const queryIcon = require('../../icons/icon-query.svg');
const downloadIcon = require('../../icons/icon-download-blue.svg');

export default class RecentItem extends Component {
  state = {
    loading: false
  };

  import = async () => {
    this.setState({ loading: true });
    const { sheetName, itemUrl, isQuery, table } = this.props;

    try {
      await this.props.import(sheetName, itemUrl, isQuery, table);
    } catch (importError) {
      this.props.setError(importError);
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      itemUrl,
      table,
      isQuery,
      sheetName,
      importing,
      index,
      toggleClearModal,
      setItemIndexToClear
    } = this.props;
    const { loading } = this.state;
    const dataset = getDestination(itemUrl);

    if (loading && !importing) {
      this.setState({ loading: false });
    }

    return (
      <div className="recent-import-item">
        <div className="recent-item-text">
          <div className="recent-item-file">
            {!isQuery && <Image className="icon-download" src={tableIcon} />}
            {isQuery && <Image className="icon-download" src={queryIcon} />}
            <a
              className="recent-item-link"
              href={createItemLink(dataset, table, isQuery)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {table.name}
            </a>
          </div>
          <div className="recent-item-dataset">
            <a
              className="recent-item-link"
              href={createWorkspaceLink(dataset)}
              target="_blank"
              rel="noopener noreferrer"
            >{`${dataset.owner}/${dataset.id}`}</a>
          </div>
          <div className="recent-item-sheet">{`Save to: ${sheetName}`}</div>
        </div>
        {loading && (
          <div className="loader-container">
            <div className="loader-icon" />
          </div>
        )}
        {!loading && (
          <div className="recent-item-image" title="Repeat import">
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip">Clear</Tooltip>}
            >
              <Glyphicon
                glyph="remove"
                className="icon-clear"
                onClick={() => {
                  setItemIndexToClear(index);
                  toggleClearModal();
                }}
              />
            </OverlayTrigger>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip">Import</Tooltip>}
              onClick={this.import}
            >
              <Image className="icon-download" src={downloadIcon} />
            </OverlayTrigger>
          </div>
        )}
      </div>
    );
  }
}
