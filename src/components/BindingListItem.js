import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {FormattedDate} from 'react-intl';

import {Button} from 'react-bootstrap';

import './BindingListItem.css';
import FileTypeIcon from './icons/FileTypeIcon';

class BindingsListItem extends Component {

  static propTypes = {
    file: PropTypes.object,
    binding: PropTypes.object,
    removeBinding: PropTypes.func,
    addBinding: PropTypes.func,
    getFilename: PropTypes.func
  }

  remove = () => {
    this.props.removeBinding(this.props.binding);
  }

  render () {
    const { addBinding, file, binding } = this.props;
    console.log(file);

    const isBindable = true;

    return (
      <div className='file' key={file.id}>
        <FileTypeIcon filename={file.name} />
        <div className='center-info'>
          <div className='title'>{file.name}</div>
          <div className='info'>{binding && `${binding.rangeAddress}&middot; `}Updated <FormattedDate value={file.updated} year='numeric' month='short' day='2-digit' /></div>
        </div>
        {isBindable && <Button
          bsSize='small'
          onClick={() => addBinding(file)}></Button>}
      </div>
    );
  }
}

export default BindingsListItem;