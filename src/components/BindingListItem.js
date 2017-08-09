import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {FormattedDate} from 'react-intl';

class BindingsListItem extends Component {

  static propTypes = {
    file: PropTypes.object,
    binding: PropTypes.object,
    removeBinding: PropTypes.func,
    getFilename: PropTypes.func
  }

  remove = () => {
    this.props.removeBinding(this.props.binding);
  }

  render () {
    const { file, binding, getFilename } = this.props;
    return (
      <div className='file' key={file.id}>
        <div className='center-info'>
          <div className='title'>{file.name}</div>
          <div className='info'>{binding && `${binding.rangeAddress}&middot; `}Updated <FormattedDate value={file.updated} year='numeric' month='short' day='2-digit' /></div>
        </div>
      </div>
    );
  }
}

export default BindingsListItem;