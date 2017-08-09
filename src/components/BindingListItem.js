import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';

import { Button, Glyphicon } from 'react-bootstrap';

import './BindingListItem.css';
import FileTypeIcon from './icons/FileTypeIcon';
import Icon from './icons/Icon';

class BindingsListItem extends Component {

  static propTypes = {
    addBinding: PropTypes.func,
    file: PropTypes.object,
    binding: PropTypes.object,
    removeBinding: PropTypes.func
  }

  remove = () => {
    this.props.removeBinding(this.props.binding);
  }

  render () {
    const { addBinding, file, binding, removeBinding } = this.props;
    let dotPos = file ? file.name.lastIndexOf('.') : -1;
    let extension = dotPos > -1 ? file.name.slice(dotPos + 1).toUpperCase() : '';

    const isBindable = !binding && extension === 'CSV';

    return (
      <div className='file' key={file.id}>
        <FileTypeIcon filename={file.name} />
        <div className='center-info'>
          <div className='title'>{file.name}</div>
          <div className='info'>{binding && `${binding.rangeAddress}&middot; `}Updated <FormattedDate value={file.updated} year='numeric' month='short' day='2-digit' /></div>
        </div>
        {isBindable && <Button
          bsSize='small'
          className='add-button'
          onClick={() => addBinding(file)}><Icon icon='add' /></Button>}
        {!!binding && <Button
          bsSize='small'
          className='unlink-button'
          onClick={() => removeBinding(binding)}><Glyphicon glyph='remove' /><span className='label'>Unlink</span></Button>}
      </div>
    );
  }
}

export default BindingsListItem;