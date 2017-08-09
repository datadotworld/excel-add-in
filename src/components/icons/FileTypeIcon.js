import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './FileTypeIcon.css';

const extensions = {
  CSV: 'tabular',
  TSV: 'tabular',
  XLSX: 'tabular',
  XLS: 'tabular',
  TTL: 'graph',
  RDF: 'graph',
  RDFS: 'graph',
  NT: 'graph',
  N3: 'graph',
  OWL: 'graph',
  TXT: 'text',
  MD: 'text',
  ZIP: 'zip',
  TAR: 'zip',
  'TAR.GZ': 'zip',
  PDF: 'pdf',
  JPG: 'image',
  JPEG: 'image',
  PNG: 'image',
  GIF: 'image',
  SVG: 'image',
  IPYNB: 'notebook',
  RMD: 'notebook',
  SQL: 'sql',
  SPARQL: 'sparql',
  'VG.JSON': 'vega',
  'VL.JSON': 'vega',
  'VEGA': 'vega',
  'N/A': 'other'
};

const insides = {
  graph: <g>
    <path className='fill fillTransparent' d='M17.3,27.8A3.68,3.68,0,0,1,12.1,33a3.65,3.65,0,0,1,0-5.2,3.74,3.74,0,0,1,5.2,0h0Z' />
    <path className='stroke' d='M17.3,27.8A3.68,3.68,0,0,1,12.1,33a3.65,3.65,0,0,1,0-5.2,3.74,3.74,0,0,1,5.2,0h0Z' />
    <path className='fill, fillTransparent' d='M34,26a3.69,3.69,0,0,1-3.7,3.7A3.61,3.61,0,0,1,26.7,26a3.69,3.69,0,0,1,3.7-3.7A3.74,3.74,0,0,1,34,26h0Z' />
    <path className='stroke' d='M34,26a3.69,3.69,0,0,1-3.7,3.7A3.61,3.61,0,0,1,26.7,26a3.69,3.69,0,0,1,3.7-3.7A3.74,3.74,0,0,1,34,26h0Z' />
    <path className='fill, fillTransparent' d='M21.7,17.4a3.74,3.74,0,0,1-5.2,0,3.68,3.68,0,0,1,5.2-5.2,3.74,3.74,0,0,1,0,5.2h0Z' />
    <path className='stroke' d='M21.7,17.4a3.74,3.74,0,0,1-5.2,0,3.68,3.68,0,0,1,5.2-5.2,3.74,3.74,0,0,1,0,5.2h0Z' />
    <path className='stroke' d='M18,18.2l-2.2,8.7m2.4,2.4,8.7-2.1' />
  </g>,
  tabular: <g>
    <path className='fill, fillTransparent' d='M7,18H17v4H7V18Z' />
    <path className='stroke' d='M7,18H17v4H7V18Z' />
    <path className='fill, fillTransparent' d='M7,14H17v4H7V14Z' />
    <path className='stroke' d='M7,14H17v4H7V14Z' />
    <path className='fill, fillTransparent' d='M17,18H38v4H17V18Z' />
    <path className='stroke' d='M17,18H38v4H17V18Z' />
    <path className='fill, fillTransparent' d='M7,22H17v4H7V22Z' />
    <path className='stroke' d='M7,22H17v4H7V22Z' />
    <path className='fill, fillTransparent' d='M17,22H38v4H17V22Z' />
    <path className='stroke' d='M17,22H38v4H17V22Z' />
    <path className='fill, fillTransparent' d='M7,26H17v4H7V26Z' />
    <path className='stroke' d='M7,26H17v4H7V26Z' />
    <path className='fill, fillTransparent' d='M17,26H38v4H17V26Z' />
    <path className='stroke' d='M17,26H38v4H17V26Z' />
    <path className='fill, fillTransparent' d='M7,30H17v4H7V30Z' />
    <path className='stroke' d='M7,30H17v4H7V30Z' />
    <path className='fill, fillTransparent' d='M17,30H38v4H17V30Z' />
    <path className='stroke' d='M17,30H38v4H17V30Z' />
  </g>,
  zip: <g>
    <path className='stroke' d='M22,7V26' />
    <path className='fill, fillTransparent' d='M22,34h0a4,4,0,0,1-4-4V26h8v4a4,4,0,0,1-4,4h0Z' />
    <path className='stroke' d='M22,34h0a4,4,0,0,1-4-4V26h8v4a4,4,0,0,1-4,4h0Z' />
    <path className='stroke' d='M19,22h6m-6-4h6m-6-4h6m-6-4h6' />
    <path className='stroke' d='M21,30h2' />
  </g>,
  pdf: <g>
    <path className='fill' d='M14,34.32h0A1.61,1.61,0,0,1,13,34a2.4,2.4,0,0,1-1.11-2.24c0.18-1.63,2.19-3.33,6-5.07A67.13,67.13,0,0,0,21.7,15.94c-1-2.17-2-5-1.26-6.64a1.92,1.92,0,0,1,1.13-1.22,4.91,4.91,0,0,1,1-.17,2.17,2.17,0,0,1,1.26,1c0.3,0.38,1,1.17-.37,6.8a31.94,31.94,0,0,0,5.09,7.56A19.45,19.45,0,0,1,31.93,23c1.57,0,2.52.37,2.9,1.12a2,2,0,0,1-.39,2.16,2.66,2.66,0,0,1-2.22,1.19c-1.22,0-2.63-.77-4.21-2.29A47.92,47.92,0,0,0,19.18,28a28.37,28.37,0,0,1-2.38,4.25c-1,1.44-1.91,2.11-2.78,2.11h0Zm2.66-5.13c-2.14,1.2-3,2.19-3.07,2.74a0.75,0.75,0,0,0,.43.69c0.15,0,1-.44,2.64-3.44h0Zm13.64-4.44c0.82,0.63,1,.94,1.55.94a1.51,1.51,0,0,0,1.21-.44,1.55,1.55,0,0,0,.23-0.41,2,2,0,0,0-1.17-.2,14.22,14.22,0,0,0-1.81.11h0Zm-7.47-6.58a71.74,71.74,0,0,1-2.67,7.56,49.92,49.92,0,0,1,6.5-2,34.23,34.23,0,0,1-3.82-5.54h0ZM22.24,9.71a2.4,2.4,0,0,0,.1,3.22c0.95-2.12-.05-3.23-0.1-3.22h0Z' />
  </g>,
  text: <g>
    <path className='fill' d='M21,18a1,1,0,1,1-1-1,1,1,0,0,1,1,1' />
    <path className='fill' d='M8,33a1,1,0,1,1-1-1,1,1,0,0,1,1,1' />
    <path className='stroke' d='M7,13h6' />
    <path className='stroke' d='M7,18h9' />
    <path className='stroke' d='M24,18h8' />
    <path className='stroke' d='M11,33h8' />
    <path className='stroke' d='M36,18h2' />
    <path className='stroke' d='M7,23H29' />
    <path className='stroke' d='M32,23h6' />
    <path className='stroke' d='M7,28h4' />
    <path className='stroke' d='M15,28H25' />
    <path className='stroke' d='M29,28h9' />
  </g>,
  image: <g>
    <path className='fill, fillTransparent' d='M17.14,18.07a4.57,4.57,0,1,1-4.57-4.57,4.57,4.57,0,0,1,4.57,4.57h0Z' />
    <path className='stroke' d='M17.14,18.07a4.57,4.57,0,1,1-4.57-4.57,4.57,4.57,0,0,1,4.57,4.57h0Z' />
    <path className='stroke' d='M1,40L18,25.52l11,11M23.5,31L34,19.5,44,29' />
  </g>,
  notebook: <g>
    <path className='fill' d='M21,18a1,1,0,1,1-1-1,1,1,0,0,1,1,1' />
    <path className='fill' d='M8,33a1,1,0,1,1-1-1,1,1,0,0,1,1,1' />
    <path className='stroke' d='M7,13h6' />
    <path className='stroke' d='M7,18h9' />
    <path className='stroke' d='M24,18h8' />
    <path className='stroke' d='M11,33h8' />
    <path className='stroke' d='M36,18h2' />
    <path className='stroke' d='M7,23H29' />
    <path className='stroke' d='M32,23h6' />
    <path className='stroke' d='M7,28h4' />
    <path className='stroke' d='M15,28H25' />
    <path className='stroke' d='M29,28h9' />
  </g>,
  vega: <g>
    <path className='fill' d='M24.7 12.2h-4.4c-.6 0-1 .5-1 1V31c0 .6.4 1 1 1h4.4c.6 0 1-.4 1-1V13.2c0-.6-.4-1-1-1zm-8.7 11h-4.4c-.7 0-1 .5-1 1V31c0 .6.3 1 1 1H16c.6 0 1-.4 1-1v-6.7c0-.6-.4-1-1-1zm17.4-5.5H29c-.6 0-1 .5-1 1V31c0 .6.4 1 1 1h4.4c.7 0 1-.4 1-1V18.7c0-.6-.3-1-1-1z' />
  </g>,
  other: <g>
    <path className='fill' d='M21,18a1,1,0,1,1-1-1,1,1,0,0,1,1,1' />
    <path className='fill' d='M8,33a1,1,0,1,1-1-1,1,1,0,0,1,1,1' />
    <path className='stroke' d='M7,13h6' />
    <path className='stroke' d='M7,18h9' />
    <path className='stroke' d='M24,18h8' />
    <path className='stroke' d='M11,33h8' />
    <path className='stroke' d='M36,18h2' />
    <path className='stroke' d='M7,23H29' />
    <path className='stroke' d='M32,23h6' />
    <path className='stroke' d='M7,28h4' />
    <path className='stroke' d='M15,28H25' />
    <path className='stroke' d='M29,28h9' />
  </g>
};

class FileTypeIcon extends Component {

  static propTypes = {
    filename: PropTypes.string
  }

  render () {

    const { filename } = this.props;
    let dotPos = filename ? filename.lastIndexOf('.') : -1;
    let extension = dotPos > -1 ? filename.slice(dotPos + 1).toUpperCase() : '';

    let insideType = extension ? extensions[extension] || 'other' : 'other';

    // because some extensions are a combination of two extensions, we have to
    // special-case those
    // .vg.json -> vega
    // .vl.json -> vega
    if (/\.v[gl]\.json$/.test(filename)) {
      dotPos = 0;
      extension = 'VEGA';
      insideType = 'vega';
    }

    const inside = insides[insideType];
    const showType = dotPos !== -1 && extension.length < 5;

    return (
      <svg className='file-type-icon' viewBox='0 0 45 58'>
        <g className={`${insideType}Type`}>
          <g id='file'>
            <path className='bg' d='M31.49,1h-29C1.65,1,1,1.65,1,2.93V56a1.51,1.51,0,0,0,1.46,1H42.54A1.51,1.51,0,0,0,44,56V14a1.38,1.38,0,0,0-.26-1.09L32.11,1.26A0.88,0.88,0,0,0,31.49,1h0Z' />
            <path className='stroke' d='M31.49,1h-29C1.65,1,1,1.65,1,2.93V56a1.51,1.51,0,0,0,1.46,1H42.54A1.51,1.51,0,0,0,44,56V14a1.38,1.38,0,0,0-.26-1.09L32.11,1.26A0.88,0.88,0,0,0,31.49,1h0Z' />
            <path className='stroke textboxStroke' d='M42.54,57H2.46A1.46,1.46,0,0,1,1,55.54V40H44V55.54A1.46,1.46,0,0,1,42.54,57h0Z' />
            <path className='fill fillTransparent' d='M32,2.39V13H42.61A0.51,0.51,0,0,0,43,12.12L32.88,2a0.51,0.51,0,0,0-.88.36h0Z' />
            <path className='stroke fileCornerStroke' d='M32,2.39V13H42.61A0.51,0.51,0,0,0,43,12.12L32.88,2a0.51,0.51,0,0,0-.88.36h0Z' />
            <path className='fill fillTransparent textboxFill' d='M42.54,57H2.46A1.46,1.46,0,0,1,1,55.54V40H44V55.54A1.46,1.46,0,0,1,42.54,57h0Z' />
          </g>
          {inside}
          {showType && <text className='text' textAnchor='middle' transform='translate(22.5 53)'>{extension}</text>}
        </g>
      </svg>
    )
  }
}

export default FileTypeIcon;