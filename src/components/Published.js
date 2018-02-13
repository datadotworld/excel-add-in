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
import { Button } from 'react-bootstrap';

import './Published.css';

class Published extends Component {
  componentDidMount () {
    // User will have scrolled to the bottom of the add in when filling in the form
    // Ensure the header is visible when this page is loaded
    window.scrollTo(0, 0)
  }

  render() {
    const { title, chart, uri } = this.props;
    return (
      <div className="published">
        <div className="published-container">
          <h3 className="published-title">{`${title} was published!`}</h3>
          <img
            className="published-chart"
            src={`data:image/png;base64, ${chart}`}
            alt="chart"
          />

          <div className='published-buttons'>
            <Button
              onClick={() => window.location.pathname = '/insights'}
              className="published-back-button"
              bsSize="xsmall"
            >
              Publish new insight
            </Button>
            <a className="published-link" href={uri} target="_blank" rel="noopener noreferrer">
              <Button
                className="published-link-button"
                bsStyle='primary'
                bsSize="xsmall"
              >
                View on data.world
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default Published;
