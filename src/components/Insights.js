import React, { Component } from 'react';
import { Grid, Row } from 'react-bootstrap';
import Icon from './icons/Icon';
import analytics from '../analytics';

import './Insights.css';


class Insights extends Component {
  closeClicked = () => {
    analytics.track('exceladdin.add_insight.close.click');
    this.props.close();
  }

  render() {
    return (
      <Grid>
        <Row className='center-block section-header insight-header'>
          <div>
            <div className='insight-title'>
              New Insight
              <Icon icon='close' className='close-button' onClick={this.closeClicked}/>
            </div>
          </div>
        </Row>
      </Grid>
    );
  }
}

export default Insights;
