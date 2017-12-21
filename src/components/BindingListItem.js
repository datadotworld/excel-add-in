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
import cx from 'classnames';

import { Button, Glyphicon } from 'react-bootstrap';

import './BindingListItem.css';
import FileTypeIcon from './icons/FileTypeIcon';
import Icon from './icons/Icon';

import analytics from '../analytics';
import { isSheetBinding, getSheetName } from '../util';

class BindingsListItem extends Component {

  static propTypes = {
    addBinding: PropTypes.func,
    file: PropTypes.object,
    binding: PropTypes.object,
    removeBinding: PropTypes.func,
    syncing: PropTypes.bool,
    syncStatus: PropTypes.object,
    editBinding: PropTypes.func
  }

  remove = () => {
    this.props.removeBinding(this.props.binding);
  }

  onEditClick = (event) => {
    analytics.track('exceladdin.file.edit_binding.click');
    const { binding, editBinding, file } = this.props;
    event.preventDefault();
    editBinding(file.name, binding);
  }

  addClick = () => {
    analytics.track('exceladdin.file.add_binding.click');
    this.props.addBinding(this.props.file);
  }

  removeClick = () => {
    analytics.track('exceladdin.file.remove_binding.click');
    this.props.removeBinding(this.props.binding);
  }

  showAddress = (binding) => {
    if (binding) {
      // If it's a sheet binding just show the sheet number
      if (isSheetBinding(binding)) {
        return getSheetName(binding);
      } else {
        return binding.rangeAddress.replace(/'/g, '');
      }
    } else {
      // Still loading
      return ''
    }
  }

  render () {
    const { file, binding, syncing, syncStatus } = this.props;

    let dotPos = file ? file.name.lastIndexOf('.') : -1;
    let extension = dotPos > -1 ? file.name.slice(dotPos + 1).toUpperCase() : '';

    const isBindable = !binding && extension === 'CSV';
    const isSyncing = syncing && syncStatus && !syncStatus.synced;
    const hasPendingChanges = syncStatus && !!syncStatus.changes;

    return (
      <div className={cx('file', extension)} key={file.id}>
        <span className={cx('file-icon', {syncing: isSyncing, 'needs-sync': hasPendingChanges})}>
          <FileTypeIcon filename={file.name} />
        </span>
        <div className='center-info'>
          <div className='title'>{file.name}</div>
          {!hasPendingChanges &&
            <div className='info'>
              {binding && <a onClick={this.onEditClick}>{this.showAddress(binding)} <Glyphicon glyph='pencil' /> · </a>}
              Updated <FormattedDate value={file.updated} year='numeric' month='short' day='2-digit' />
            </div>}
          {hasPendingChanges && <div className='info'>{syncStatus.changes} pending changes</div>}
        </div>
        {isBindable && <Button
          bsSize='small'
          className='add-button'
          onClick={this.addClick}><Icon icon='add' /></Button>}
        {!!binding && !isSyncing && <Button
          bsSize='small'
          className='link-button'
          onClick={this.removeClick}>
            <div className='link'>
              <Icon className='check' icon='check' />
            </div>
          </Button>}
          {!!binding && isSyncing &&
            <div className='loader-icon-container'>
              <div className='loader-icon' />
            </div>
          }
      </div>
    );
  }
}

export default BindingsListItem;