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

import { Checkbox } from 'react-bootstrap';

import analytics from '../analytics';
import WarningModal from './WarningModal';

class CSVWarningModal extends Component {
  static propTypes = {
    successHandler: PropTypes.func
  };

  state = {
    checkboxChecked: false
  };

  toggleCheckbox = () => {
    analytics.track('csv_warning.dont_show.toggle');
    this.setState({ checkboxChecked: !this.state.checkboxChecked });
  };

  success = () => {
    this.props.successHandler({ dismissWarning: this.state.checkboxChecked });
  };

  render() {
    return (
      <WarningModal
        show={this.props.show}
        dialogMode="continue"
        successHandler={this.success}
        analyticsLocation="csv_warning"
      >
        <div>
          <strong>
            If you save to data.world as .CSV some Excel formatting will be
            lost.
          </strong>
        </div>
        <div>
          To make sure that your settings will be remembered, use "File > Save
          as" to save this file using the Excel Workbook (.xlsx) format.
        </div>
        <div>
          <Checkbox
            onChange={this.toggleCheckbox}
            checked={this.state.checkboxChecked}
          >
            Don't show again
          </Checkbox>
        </div>
      </WarningModal>
    );
  }
}

export default CSVWarningModal;
