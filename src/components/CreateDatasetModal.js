import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { 
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

import Icon from './icons/Icon';

import './CreateDatasetModal.css';

class CreateDatasetModal extends Component {

  static propTypes = {
    close: PropTypes.func,
    createDataset: PropTypes.func,
    linkNewDataset: PropTypes.func,
    user: PropTypes.object
  }

  state = {
    isSubmitting: false,
    title: '',
    visibility: 'OPEN'
  }

  submit = (event) => {
    event.preventDefault();
    this.setState({isSubmitting: true});
    const dataset = {
      title: this.state.title,
      visibility: this.state.visibility
    };
    this.props.createDataset(dataset).then((createdDataset) => {
      this.props.linkNewDataset(createdDataset.uri).then(() => {
        this.props.close();
      });
    }).catch((error) => {

    });
  }

  isDatasetValid = () => {
    const {title} = this.state;
    return title && title.length > 0 && title.length <= 60;
  }

  visibilityChanged = (event) => {
    this.setState({visibility: event.target.value});
  }

  render () {
    const {close, user} = this.props;
    const {title, visibility} = this.state;
    let datasetValidState;

    if (title) {
      datasetValidState = this.isDatasetValid() ? 'success' : 'warning'
    }

    return (
      <Grid className='create-dataset-modal'>
        <Row className='center-block header'>
          <div className='title'>
            Create a new dataset <Icon icon='close' className='close-button' onClick={close} />
          </div>
        </Row>
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
                This will also be your dataset URL: data.world/{user.id}/<strong>cool-new-data</strong>
                <div className='titleLimit'>max. 60</div>
              </HelpBlock>  
            </FormGroup>
            <FormGroup>
              <Radio
                name='privacy'
                onChange={this.visibilityChanged}
                checked={visibility === 'OPEN'}
                className={visibility === 'OPEN' ? 'checked' : ''}
                value='OPEN'>
                <div className='radio-label'>Open</div>
                <div className='radio-option-description'>Publicly available data that anyone can view, query, or download.</div>
              </Radio>
              <Radio
                name='privacy'
                onChange={this.visibilityChanged}
                checked={visibility === 'PRIVATE'}
                className={visibility === 'PRIVATE' ? 'checked' : ''}
                value='PRIVATE' >
                <div className='radio-label'>Private <Glyphicon glyph='lock' /></div>
                <div className='radio-option-description'>Will only be shared with others you invite. Use for personal or sensitive information.</div>
              </Radio>
            </FormGroup>
            <div className='button-group'>
              <Button onClick={close}>Cancel</Button>
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