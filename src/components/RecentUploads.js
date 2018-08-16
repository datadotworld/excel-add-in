import React, { Component } from 'react';

import { 
  Button,
  ControlLabel,
  Image
} from 'react-bootstrap';
import Icon from './icons/Icon';
import './DatasetItem.css';
import LoadingAnimation from './LoadingAnimation';

const { localStorage } = window;

class RecentItem extends Component {  

  state = {
    shouldShowDate: false,
    toShow: '',
    loading: false
  }

  componentDidMount() {
    const {previousDate, dateToShow, changePreviousDate, stopShowingDate} = this.props
    if (previousDate !== dateToShow) {
      this.setState({shouldShowDate: true})
      changePreviousDate(dateToShow)
    } else {
      stopShowingDate()
    }
  }

  submitBinding = async (filename, sheetId, range) => {
    this.setState({loading: true})
    const {
      close,
      createBinding,
      refreshLinkedDataset,
      sync,
      addUrl,
      dataset
    } = this.props;
    const { loading } = this.state
    const selection = {
      name: filename,
      sheetId: sheetId,
      range: range
    };
    addUrl(dataset)
    await createBinding(selection).then((binding) => {
      // Binding has been created, but the file does not exist yet, sync the file
      sync(binding).then(refreshLinkedDataset).then(close);
    })
    this.setState({loading: false})
  }

  render() {
    const { filename, dataset, range, sheetId, dateToShow } = this.props
    const { shouldShowDate, loading } = this.state
    const regexMatch = /https:\/\/data\.world\/(.*)\/(.*)/
    const tabular = require('./icons/icon-tabular.svg')
    const match = dataset ? dataset.match(regexMatch) : 'Undefined'
    const rangeToShow = range ? range : 'Undefined'
    const datasetSlug = `=${rangeToShow}`
    const loool = `${match[1]}/${match[2]}`
    return (
      <div>
        <div className='date'>{dateToShow}</div>
        <div className='dataset recent'>
          <Image className='tabular-icon' src={tabular}/>
          <div className='center-info'>
            <div>
              <div className='title'>{filename}</div>
              <div className='info'>{loool}</div>
            </div>
            <div className='info'>{datasetSlug}</div>
          </div>
          {this.state.loading ? <div className='icon-border'> <LoadingAnimation/> </div>
          : <div className='icon-border' onClick={() => this.submitBinding(filename, sheetId, range)}>
            <div className='resync-icon'>
              <Icon icon='sync' />
            </div>
          </div>}
        </div>
      </div>
    )
  }
}

class RecentUploads extends Component {
  state = {
    previousDate: '',
    shouldShowDate: false
  }

  changePreviousDate = async (newDate) => {
    await this.setState({previousDate: newDate, shouldShowDate: true})
    console.log("new date", this.state.previousDate)
  }

  stopShowingDate = () => {
    this.setState({shouldShowDate: false})
  }

  render () {
    const { forceShowUpload, createBinding, sync, user } = this.props
    const { previousDate, shouldShowDate } = this.state
    const parsedHistory = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')).reverse() : []
    return (
      <div>
        <div className='full-screen-modal category-title'>
          <ControlLabel className='large-header'>Recent Uploads</ControlLabel>
          <Button bsStyle='link' className='upload-button' onClick={() => forceShowUpload()}>+ New upload </Button>
        </div>
        {parsedHistory.map((entry, index) => {
          const parsedEntry = JSON.parse(Object.keys(JSON.parse(entry)).map(key => JSON.parse(entry)[key])[0])
          if (parsedEntry.userId === user) {
            const dateArray = new Date(parsedEntry.date).toDateString().split(" ")
            let dateToShow = dateArray[1] + " " + dateArray[2]
            return (
              <div key={index}>
                <RecentItem 
                  filename={parsedEntry.filename}
                  dataset={parsedEntry.dataset}
                  bindingInfo={parsedEntry.bindingInfo}
                  sheetId={parsedEntry.sheetId}
                  range={parsedEntry.range}
                  createBinding={createBinding}
                  sync={sync}
                  addUrl={this.props.addUrl}
                  dateToShow={dateToShow}
                  previousDate={previousDate}
                  shouldShowDate={shouldShowDate}
  
                  changePreviousDate={this.changePreviousDate}
                  stopShowingDate={this.stopShowingDate}
                />
              </div>) 
          }
        })}
        <div className='category-reminder'>
          Showing 10 most recent uploads
        </div>
      </div>
    )
  }
}

export default RecentUploads