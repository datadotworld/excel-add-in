/*
 * Copyright 2017 data.world, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This product includes software developed at
 * data.world, Inc. (http://data.world/).
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Alert,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  Grid,
  HelpBlock,
  InputGroup,
  Radio,
  Row
} from 'react-bootstrap';
import { kebabCase } from 'lodash';

import Icon from './icons/Icon';
import './CreateDatasetModal.css';

import analytics from '../analytics';

class CreateDatasetModal extends Component {

  static propTypes = {
    close: PropTypes.func,
    createDataset: PropTypes.func,
    user: PropTypes.object
  }

  state = {
    isSubmitting: false,
    title: '',
    visibility: 'PRIVATE',
    error: null
  }

  submit = (event) => {
    console.log("submitting")
    analytics.track('exceladdin.create_dataset.submit.click');
    event.preventDefault();
    this.setState({isSubmitting: true});
    const dataset = {
      title: this.state.title,
      visibility: this.state.visibility
    };
    this.props.createDataset(dataset).then((createdDataset) => {
      this.props.linkDataset(createdDataset.uri)
      this.props.close();
    }).catch((error) => {
      if (error && error.response && error.response.data && error.response.data.message === 'Attempted to create an entity that already exists.') {
        error = {message: 'A dataset with that name already exists, please try again.'};
      }

      this.setState({
        error,
        isSubmitting: false
      });
    });
  }

  isDatasetValid = () => {
    const {title} = this.state;
    return title && title.length > 0 && title.length <= 60;
  }

  visibilityChanged = (event) => {
    analytics.track('exceladdin.create_dataset.visibility.change', {visibility: event.target.value});
    this.setState({visibility: event.target.value});
  }

  closeClicked = () => {
    analytics.track('exceladdin.create_dataset.close.click');
    this.props.close();
  }

  cancelClicked = () => {
    analytics.track('exceladdin.create_dataset.cancel_button.click');
    this.props.close();
  }

  dismissError = () => {
    this.setState({error: null});
  }
  componentDidMount() {
    this.props.showDatasets()
  }
  componentWillUnmount() {
    this.cancelClicked
  }

  render () {
    const { user } = this.props;
    const { title, visibility, error } = this.state;
    let datasetValidState;

    if (title) {
      datasetValidState = this.isDatasetValid() ? 'success' : 'warning'
    }

    return (
      <Grid className='create-dataset-modal full-screen-modal show'>
        <Row className='center-block header'>
          <div className='title'>
            Create a new dataset <Icon icon='close' className='close-button' onClick={this.closeClicked} />
          </div>
        </Row>
        {error && <Alert bsStyle='warning' onDismiss={this.dismissError}>{error && error.message}</Alert>}
        <Row className='center-block'>
          <form onSubmit={this.submit}>
            <FormGroup validationState={datasetValidState}>
              <ControlLabel>Dataset title</ControlLabel>
              <InputGroup>
                <FormControl
                  onChange={(event) => this.setState({title: event.target.value})}
                  value={title}
                  autoFocus
                  type='text' />
              </InputGroup>
              <HelpBlock>
                This will also be your dataset URL: data.world/{user.id}/<strong>{title ? kebabCase(title) : 'cool-new-data'}</strong>
                <div className='titleLimit'>max. 60</div>
              </HelpBlock>  
            </FormGroup>
            <FormGroup>
            <Radio
                name='privacy'
                onChange={this.visibilityChanged}
                checked={visibility === 'PRIVATE'}
                className={visibility === 'PRIVATE' ? 'checked' : ''}
                value='PRIVATE' >
                <div className='radio-label'>Private <Glyphicon glyph='lock' /></div>
                <div className='radio-option-description'>Will only be shared with others you invite.</div>
              </Radio>
              <Radio
                name='privacy'
                onChange={this.visibilityChanged}
                checked={visibility === 'OPEN'}
                className={visibility === 'OPEN' ? 'checked' : ''}
                value='OPEN'>
                <div className='radio-label'>Open</div>
                <div className='radio-option-description'>Publicly available data that anyone can view, query, or download.</div>
              </Radio>
            </FormGroup>
            <div className='button-group'>
              <Button onClick={this.cancelClicked}>Cancel</Button>
              <Button
                type='submit'
                disabled={this.state.isSubmitting || datasetValidState !== 'success'}
                bsStyle='primary'>Create dataset</Button>
            </div>
          </form>
        </Row>
      </Grid>
    )
  }
}

export default CreateDatasetModal;