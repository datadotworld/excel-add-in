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
import { FormattedDate } from 'react-intl';

import './LibraryItem.css';
import Icon from '../../../icons/Icon';

class LibraryItem extends Component {
  static propTypes = {
    item: PropTypes.object,
    buttonText: PropTypes.string,
    buttonHandler: PropTypes.func,
    buttonLink: PropTypes.string
  };

  buttonClick = () => {
    if (this.props.buttonHandler) {
      const { item } = this.props;
      const uri = `${item.owner}/${item.id}`;
      this.props.buttonHandler(uri);
    }
  };

  render() {
    const { item, isProject } = this.props;

    if (item.isCreate) {
      return (
        <div className="item" onClick={this.buttonClick}>
          <Icon icon="datasetSchema" />
          <div className="center-info">
            <div className="title">
              {`Create a new ${isProject ? 'project' : 'dataset'}`}
            </div>
          </div>
          <div className="link-icon">
            <Icon icon="angleRight" />
          </div>
        </div>
      );
    }
    return (
      <div className="item" onClick={this.buttonClick}>
        <Icon icon={isProject ? 'projectSchema' : 'datasetSchema'} />
        <div className="center-info">
          <div className="title">{item.title}</div>
          <div className="info">
            @{item.owner} &middot; Updated{' '}
            <FormattedDate
              value={item.updated}
              year="numeric"
              month="short"
              day="2-digit"
            />
          </div>
        </div>
        <div className="link-icon">
          <Icon icon="angleRight" />
        </div>
      </div>
    );
  }
}

export default LibraryItem;
