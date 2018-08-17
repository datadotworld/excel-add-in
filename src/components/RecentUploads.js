import React, { Component } from 'react';

import { 
  Button,
  ControlLabel,
  Image
} from 'react-bootstrap';
import Icon from './icons/Icon';
import './DatasetItem.css';
import LoadingAnimation from './LoadingAnimation';

class RecentItem extends Component {  

  state = {
    loading: false
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
    const { filename, dataset, range, sheetId, unsynced } = this.props
    const regexMatch = /https:\/\/data\.world\/(.*)\/(.*)/
    const tabular = require('./icons/icon-tabular.svg')
    const match = dataset ? dataset.match(regexMatch) : 'Undefined'
    const rangeToShow = range ? range : 'Undefined'
    const datasetSlug = `=${rangeToShow}`
    const datasetLocation = `${match[1]}/${match[2]}`
    return (
      <div>
        <div className='dataset recent'>
          <Image className='tabular-icon' src={tabular}/>
          <div className='center-info'>
            <div>
              <div className='title'>{filename}</div>
            </div>
            <div className='info'>{datasetSlug}</div>
            <div className='info'>{datasetLocation}</div>
          </div>
          {this.state.loading ? <div className='icon-border'> <LoadingAnimation/> </div>
          : <div className='icon-border' onClick={() => this.submitBinding(filename, sheetId, range)}>
            <div className={unsynced ? 'unsync-icon' : 'resync-icon'}>
              <Icon icon='sync' />
            </div>
          </div>}
        </div>
      </div>
    )
  }
}

class RecentUploads extends Component {
  findBindingForFile = (file) => {
    return this.props.bindings.find((binding) => {
      return binding.id === `dw::${file.filename}`;
    });
  }

  render () {
    const { forceShowUpload, createBinding, sync, user, workbook, matchedFiles, syncStatus } = this.props
    let previousDate = ''
    let showDate = true
    return (
      <div>
        <div className='full-screen-modal category-title'>
          <ControlLabel className='large-header'>Recent Uploads</ControlLabel>
          <Button bsStyle='link' className='upload-button' onClick={() => forceShowUpload()}>+ New upload </Button>
        </div>
        {matchedFiles.slice(0, 10).map((entry, index) => {
          const parsedEntry = JSON.parse(Object.keys(JSON.parse(entry)).map(key => JSON.parse(entry)[key])[0])
          if (parsedEntry.userId === user && parsedEntry.workbook === workbook) {
            const binding = this.findBindingForFile(parsedEntry)
            let unsynced = false
            if (binding && !syncStatus[binding.id].synced) {
              unsynced = true
            }
            const dateArray = new Date(parsedEntry.date).toDateString().split(" ")
            let dateToShow = dateArray[1] + " " + dateArray[2]
            if (dateToShow !== previousDate) {
              previousDate = dateToShow
              showDate = true
            } else {
              showDate = false
            }
            return (
              <div key={index}>
              {showDate && <div className='date'>{dateToShow}</div>}
                <RecentItem 
                  filename={parsedEntry.filename}
                  dataset={parsedEntry.dataset}
                  bindingInfo={parsedEntry.bindingInfo}
                  sheetId={parsedEntry.sheetId}
                  range={parsedEntry.range}
                  createBinding={createBinding}
                  sync={sync}
                  addUrl={this.props.addUrl}
                  unsynced={unsynced}
                />
              </div>) 
          } else {
            return null
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