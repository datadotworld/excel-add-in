import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { 
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Grid,
  HelpBlock,
  InputGroup,
  Row
} from 'react-bootstrap';

import Icon from './icons/Icon';

import './AddDataModal.css';

const filenameRegex = /^[^/]+$/;
const MAX_FILENAME_LENGTH = 128;

class AddDataModal extends Component {
  static propTypes = {
    close: PropTypes.func,
    createBinding: PropTypes.func,
    range: PropTypes.string,
    sync: PropTypes.string
  }

  state = {
    isSubmitting: false,
    name: ''
  }

  isFormValid = () => {
    const { name } = this.state;
    const { range } = this.props;
    if (!range || !name) {
      return false;
    }
    return name.match(filenameRegex) && name.length < MAX_FILENAME_LENGTH;
  }

  submit = (event) => {
    event.preventDefault();
    const { close, createBinding, sync } = this.props;
    createBinding(`${this.state.name}.csv`).then((binding) => {
      // Binding has been created, but the file does not exist yet, sync the file
      sync(binding).then(() => {
        console.log('sync complete');
        close();
      });
    });
  }

  render () {
    const { name } = this.state;
    const { close, range } = this.props;

    let validState;

    if (name) {
      validState = this.isFormValid() ? 'success' : 'warning'
    }

    return (
      <Grid className='add-data-modal modal show'>
        <Row className='center-block header'>
          <div className='title'>
            Add data <Icon icon='close' className='close-button' onClick={close} />
          </div>
        </Row>
        <Row className='center-block'>
          <form onSubmit={this.submit}>
            <FormGroup>
              <ControlLabel>Dataset range</ControlLabel>
              <InputGroup>
                <FormControl
                  value={range}
                  disabled
                  placeholder='Click to select range'
                  type='text' />
              </InputGroup>
            </FormGroup>

            <FormGroup validationState={validState}>
              <ControlLabel>Name</ControlLabel>
              <InputGroup>
                <FormControl
                  onChange={(event) => this.setState({name: event.target.value})}
                  value={name}
                  type='text' />
              </InputGroup>
              <HelpBlock>
                Must not include slashes
                <div className='titleLimit'>max. 128</div>
              </HelpBlock>  
            </FormGroup>
            <div className='button-group'>
              <Button onClick={close}>Cancel</Button>
              <Button
                type='submit'
                disabled={this.state.isSubmitting || validState !== 'success'}
                bsStyle='primary'>Add selection</Button>
            </div>
          </form>
        </Row>
      </Grid>);
  }
}

export default AddDataModal;