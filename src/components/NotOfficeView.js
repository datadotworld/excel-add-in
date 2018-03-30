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

import React, { Component } from 'react'
import {Col, Grid} from 'react-bootstrap'
import './NotOfficeView.css'
import analytics from '../analytics'

import sparkle from '../static/img/new-sparkle-logo.png'

class NotOfficeView extends Component {

  supportLinkClick = () => {
    analytics.track('exceladdin.not_office_view.support.click');
  }

  installLinkClick = () => {
    analytics.track('exceladdin.not_office_view.install.click');
  }

  render () {
    return (
      <Grid className='notOfficeView'>
        <Col md={6} mdOffset={3} xs={10} xsOffset={1}>
          <img src={sparkle} alt='data.world sparkle logo'/>
          <h2>
          data.world + Excel
          </h2>
          <p>Install the data.world add-in for Excel from Microsoft <a
            href='https://appsource.microsoft.com/en-us/product/office/WA104381270?src=office&tab=Overview'
            target='_blank'
            onClick={this.installLinkClick}
            rel='noopener noreferrer'
          >AppSource</a></p>
          <a
            href='https://data.world/integrations/excel'
            target='_blank'
            onClick={this.supportLinkClick}
            rel="noopener noreferrer"
          >
            Learn more
          </a>
        </Col>
      </Grid>
    )
  }
}

export default NotOfficeView;