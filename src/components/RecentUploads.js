import React, { Component } from 'react';

import { 
  Button,
  ControlLabel,
} from 'react-bootstrap';
import analytics from '../analytics';

import Icon from './icons/Icon';
import './DatasetItem.css';

const { localStorage } = window;

class RecentItem extends Component {  

  submitBinding = (filename, sheetId, range) => {
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
    createBinding(selection).then((binding) => {
      // Binding has been created, but the file does not exist yet, sync the file
      sync(binding).then(refreshLinkedDataset).then(close);
    })
  }

  render() {
    const { filename, dataset, range, sheetId } = this.props

    const regexMatch = /https:\/\/data\.world\/(.*)\/(.*)/
    const match = dataset.match(regexMatch)
    const rangeToShow = range ? range : 'Undefined'
    const datasetSlug = `=${rangeToShow} > ${match[1]}/${match[2]}`

    return (
      <div className='dataset' onClick={() => this.submitBinding(filename, sheetId, range)}>
      <Icon icon='datasetSchema'/>
      <div className='center-info'>
        <div className='title'>{filename}</div>
        <div className='info'>{datasetSlug}</div>
      </div>
      <div className='link-icon'>
        <Icon icon='angleRight' />
      </div>
    </div>
    )
  }
}


class RecentUploads extends Component {
  render () {
    const { forceShowUpload, createBinding, sync } = this.props
    const parsedHistory = JSON.parse(localStorage.getItem('history'))
    console.log("parsed history", parsedHistory)
    return (
      <div>
        <div className='full-screen-modal category-title'>
          <ControlLabel>Recent Uploads</ControlLabel>
          <Button onClick={() => forceShowUpload()}> New upload </Button>
        </div>
        {parsedHistory.map(entry => {
          const parsedEntry = JSON.parse(Object.values(JSON.parse(entry))[0])

          return (
            <div>
              <RecentItem 
              filename={parsedEntry.filename}
              dataset={parsedEntry.dataset}
              bindingInfo={parsedEntry.bindingInfo}
              sheetId={parsedEntry.sheetId}
              range={parsedEntry.range}
              createBinding={createBinding}
              sync={sync}
              addUrl={this.props.addUrl}
              />
            </div>
          )
        })}
      </div>
    )
  }
}

export default RecentUploads