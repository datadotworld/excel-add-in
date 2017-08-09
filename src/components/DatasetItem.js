import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {FormattedDate} from 'react-intl';
import {Button} from 'react-bootstrap';

import './DatasetItem.css';
import DatasetSchema from './icons/DatasetSchema';

class DatasetItem extends Component {

  static propTypes = {
    dataset: PropTypes.object,
    buttonText: PropTypes.string,
    buttonHandler: PropTypes.func,
    buttonLink: PropTypes.string
  }

  buttonClick = () => {
    if (this.props.buttonHandler) {
      this.props.buttonHandler(this.props.dataset);
    }
  }

  render () {
    const {dataset, buttonText, buttonLink} = this.props;
    return (<div className='dataset'>
      <DatasetSchema />
      <div className='center-info'>
        <div className='title'>{dataset.title}</div>
        <div className='info'>@{dataset.owner} &middot; Updated <FormattedDate value={dataset.updated} year='numeric' month='short' day='2-digit' /></div>
      </div>
      {!!buttonLink && <Button
        bsSize='small'
        href={buttonLink}
        target='_blank'
        onClick={this.buttonClick}>{buttonText}</Button>}
      {!buttonLink && <Button
        bsSize='small'
        onClick={this.buttonClick}>{buttonText}</Button>}
    </div>)
  }
}

export default DatasetItem;