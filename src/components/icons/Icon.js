import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Icons.css';

const datasetSchema = <svg className='dataset-schema-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path className='fill' d='M15,0H1C0.4,0,0,0.4,0,1v14c0,0.6,0.4,1,1,1h14c0.6,0,1-0.4,1-1V1C16,0.4,15.6,0,15,0z M8,13.5L2.2,9.9l1.5-1L8,11.5l4.3-2.7l1.5,0.9L8,13.5z M8,9.9L2.2,6.1L8,2.5l5.8,3.6L8,9.9z'></path></svg>;

const add = <svg className='add-icon' version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' viewBox='0 0 16 16'>
  <g>
    <line className='stroke' x1='8' y1='1' x2='8' y2='15'/>
    <line className='stroke' x1='15' y1='8' x2='1' y2='8'/>
  </g>
</svg>;

const close = <svg className='close-icon' width='16' height='15' viewBox='0 0 16 15' xmlns='http://www.w3.org/2000/svg'>
  <path className='stroke stroke-medium' d='M15.222 14.222L1 0M1 14.222L15.222 0'/>
</svg>;

const check = <svg className='check-icon' width='16px' height='16px' viewBox='0 0 16 16' version='1.1' xmlns='http://www.w3.org/2000/svg'>
  <g stroke-width='2'>
    <polyline className='stroke' points='1 7.2 5.9 12.1 15 3'></polyline>
  </g>
</svg>;

const ICONS = {
  add, check, close, datasetSchema
};

export default class Icon extends Component {

  static propsTypes = {
    className: PropTypes.string,
    icon: PropTypes.string,
    onClick: PropTypes.func
  }

  render () {
    const { className, icon, onClick } = this.props;
    return (
      <span className={`svg-icon ${className || ''}`} onClick={onClick}>
        {ICONS[icon]}
      </span>
    );
  }
}