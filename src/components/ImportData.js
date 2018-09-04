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
import { Grid, Row, Button } from 'react-bootstrap';
import importImage from '../static/img/import-data.jpg';

import './ImportData.css';

const ImportData = () => {
  return (
    <Grid className="import">
      <Row className='center-block section-header import-container'>
        <div className="import-text">
          <div className="import-text-header">Import from data.world</div>
          <div className="import-text-body">
            Importing data from data.world to Excel is easy.<br />
            Simply write a query and download the results<br />as an .xlsx file
          </div>
        </div>
        <img
          src={importImage}
          alt="Import data instructions"
          className="import-image"
        />
        <a
          className="import-link"
          target="_blank"
          rel="noopener noreferrer"
          href="https://data.world/sparklesquad/the-easiest-way-to-do-advanced-business-sql/workspace/query?queryid=c48badee-0d48-4dfb-b6ee-ab1e87e6aae6"
        >
          <Button
            bsStyle="primary"
            className="import-button"
          >
            See an example
          </Button>
        </a>
      </Row>
    </Grid>
  );
}

export default ImportData;
