import React, { Component } from 'react';
import './LoadingAnimation.css';

class LoadingAnimation extends Component {
  render () {
    return (
      <div className='loaderoverlay'>
        <div className='loader'>Loading...</div>
      </div>
    );
  }
}

export default LoadingAnimation;