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
import { Button } from 'react-bootstrap';

import analytics from '../analytics';

import './DatasetItem.css';
import Icon from './icons/Icon';

class DatasetItem extends Component {
  static propTypes = {
    dataset: PropTypes.object,
    buttonText: PropTypes.string,
    buttonHandler: PropTypes.func,
    buttonLink: PropTypes.string
  };

  buttonClick = () => {
    analytics.track(
      `exceladdin.dataset.${this.props.buttonText.toLowerCase()}.click`
    );
    if (this.props.buttonHandler) {
      this.props.buttonHandler(this.props.dataset);
    }
  };

  render() {
    const { dataset, buttonText, buttonLink } = this.props;
    return (
      <div className="dataset">
        <Icon icon={dataset.isProject ? 'projectSchema' : 'datasetSchema'} />
        <div className="center-info">
          <div className="title">{dataset.title}</div>
          <div className="info">
            @{dataset.owner} &middot; Updated{' '}
            <FormattedDate
              value={dataset.updated}
              year="numeric"
              month="short"
              day="2-digit"
            />
          </div>
        </div>
        {!!buttonLink && (
          <Button
            bsSize="small"
            href={buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={this.buttonClick}
          >
            {buttonText}
          </Button>
        )}
        {!buttonLink && (
          <Button bsSize="small" onClick={this.buttonClick}>
            {buttonText}
          </Button>
        )}
      </div>
    );
  }
}

export default DatasetItem;
