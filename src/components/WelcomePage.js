import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { 
  Button,
  Col,
  Grid,
  Row
} from 'react-bootstrap';

import './WelcomePage.css';
import sparkle from '../static/img/new-sparkle-logo.png';

class WelcomePage extends Component {

  static propTypes = {
    dataset: PropTypes.object
  }

  constructor () {
    super();
    this.oauthClientId = process.env.REACT_APP_OAUTH_CLIENT_ID;
    this.oauthRedirectURI = process.env.REACT_APP_OAUTH_REDIRECT_URI;
  }

  startAuthFlow = () => {
    window.location = `https://data.world/oauth/authorize?client_id=${this.oauthClientId}&redirect_uri=${this.oauthRedirectURI}`;
  }

  render () {
    const {dataset} = this.props;
    return (
      <Grid className='welcome-page'>
        <Row className='center-block'>
          <Col md={6} mdOffset={3} xs={10} xsOffset={1}>
            <img src={sparkle} className='header-image center-block' alt='data.world sparkle logo' />
            <h1 className='header'>data.world</h1>
            {!dataset && <div>
              <div className='description'>This is some text describing what this is and how it works.</div>
              <Button
                  className='center-block'
                  onClick={this.startAuthFlow}
                  bsStyle='primary'>Get Started</Button>
            </div>}
            {dataset && <div>
              <div>The spreadsheet is linked to the following dataset on data.world</div>
              <div className='dataset'>{dataset.title}</div>
              <div>Log in to save changes to data.world as you make them</div>
              <Button
                  className='center-block'
                  onClick={this.startAuthFlow}
                  bsStyle='primary'>Login</Button>
            </div>}
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default WelcomePage;