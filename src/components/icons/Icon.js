/*
 * Copyright 2017 data.world, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This product includes software developed at
 * data.world, Inc. (http://data.world/).
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Icons.css';

const datasetSchema = <svg className='dataset-schema-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path className='fill' d='M15,0H1C0.4,0,0,0.4,0,1v14c0,0.6,0.4,1,1,1h14c0.6,0,1-0.4,1-1V1C16,0.4,15.6,0,15,0z M8,13.5L2.2,9.9l1.5-1L8,11.5l4.3-2.7l1.5,0.9L8,13.5z M8,9.9L2.2,6.1L8,2.5l5.8,3.6L8,9.9z'></path></svg>;

const projectSchema = <svg className='project-schema-icon' version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' viewBox='0 0 16 16'>
  <path className='fill' d='M15,0H1C0.4,0,0,0.4,0,1v14c0,0.6,0.4,1,1,1h14c0.6,0,1-0.4,1-1V1C16,0.4,15.6,0,15,0z M13.6,6.3l-2.3,3.5c-0.3,0.6-1.3,0.7-1.7,0.2L7,7.5l-2.7,3.6c-0.3,0.5-1.2,0.6-1.6,0.2C2.2,11,2.1,10.1,2.4,9.7L5.9,5c0.5-0.6,1.3-0.6,1.7-0.1l2.4,2.4L11.6,5c0.3-0.6,1-0.7,1.6-0.3C13.8,5,13.9,5.7,13.6,6.3z'/>
</svg>;


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

const sync = <svg className='sync-icon' width='16' height='15' viewBox='0 0 35 32' xmlns='http://www.w3.org/2000/svg'><title>sync</title><g fill-rule='evenodd' opacity='.8' className='fill'><path d='M11.487 12.78c.104.047.215.07.325.07.187 0 .373-.067.52-.195l6.3-5.512c.17-.15.268-.366.268-.593 0-.227-.098-.443-.27-.593L12.33.445C12.1.242 11.77.193 11.488.32c-.282.128-.462.408-.462.718v3.937c-6.263 0-11.323 5.25-11.012 11.58.293 5.923 5.402 10.47 11.332 10.47h.467c.435 0 .788-.353.788-.787v-1.575c0-.435-.353-.788-.787-.788h-.788c-4.52 0-8.164-3.83-7.857-8.415.274-4.087 3.785-7.185 7.857-7.322v3.924c0 .31.18.59.462.717zM34.637 16.555c.31-6.33-4.75-11.58-11.012-11.58h-.788c-.434 0-.787.353-.787.788v1.575c0 .434.353.787.787.787h.788c4.52 0 8.164 3.83 7.857 8.415-.274 4.087-3.785 7.185-7.857 7.322v-3.924c0-.31-.18-.59-.462-.717-.28-.127-.612-.078-.844.125l-6.3 5.512c-.172.15-.27.366-.27.593 0 .227.098.443.27.593l6.3 5.512c.145.128.33.195.517.195.11 0 .222-.023.326-.07.282-.128.462-.408.462-.718V27.01c5.79-.16 10.724-4.64 11.012-10.455z'/></g></svg>;

const ICONS = {
  add, check, close, datasetSchema, projectSchema, sync
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