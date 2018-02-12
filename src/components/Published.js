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
import React from 'react';
import { Button } from 'react-bootstrap';

import './Published.css';

const Published = (props) => (
  <div className="published">
    <div className="published-container">
      <h3 className="published-title">{`${props.title} was published!`}</h3>
      <img
        className="published-chart"
        src={`data:image/png;base64, ${props.chart}`}
        alt="chart"
      />

      <div className='published-buttons'>
        <Button
          onClick={() => window.location.pathname = '/insights'}
          className="published-back-button"
        >
          Publish new insight
        </Button>
        <a className="published-link" href={props.uri} target="_blank">
          <Button
            className="published-link-button"
            bsStyle='primary'
          >
            View on data.world
          </Button>
        </a>
      </div>
    </div>
  </div>
);

export default Published;
