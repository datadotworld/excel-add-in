import React, { Component } from 'react';

import { 
  Button,
  ControlLabel,
  Image
} from 'react-bootstrap';
import PaginatedTable from './PaginatedTable'
import Icon from './icons/Icon';
import './DatasetItem.css';

const { localStorage } = window;
const PAGE_LIMIT = 5

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
    const { filename, dataset, range, sheetId, dateToShow } = this.props
    const regexMatch = /https:\/\/data\.world\/(.*)\/(.*)/
    const tabular = require('./icons/icon-tabular.svg')
    const match = dataset.match(regexMatch)
    const rangeToShow = range ? range : 'Undefined'
    const datasetSlug = `=${rangeToShow} > ${match[1]}/${match[2]}`
    const date = `Last modified: ${dateToShow}`
    return (
      <div>
        <div className='dataset recent'>
          <Image className='tabular-icon' src={tabular}/>
          <div className='center-info'>
            <div className='title'>{filename}</div>
            <div className='info'>{datasetSlug}</div>
            <div className='info'>{date}</div>
          </div>
          <div className='icon-border' onClick={() => this.submitBinding(filename, sheetId, range)}>
            <div className='resync-icon'>
              <Icon icon='sync' />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class RecentUploads extends Component {
  state = {
    previousDate: '',
    shouldShowDate: true,
    page: 1
  }

  render () {
    const { forceShowUpload, createBinding, sync } = this.props
    const { page } = this.state
    const parsedHistory = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')).reverse() : []
    const lowerLimit = (page - 1) * PAGE_LIMIT
    const upperLimit = page * PAGE_LIMIT
    const itemsToShow = <tbody>
      {parsedHistory.slice(lowerLimit, upperLimit).map((entry, index) => {
        const parsedEntry = JSON.parse(Object.keys(JSON.parse(entry)).map(key => JSON.parse(entry)[key])[0])
        const dateArray = new Date(parsedEntry.date).toDateString().split(" ")
        const dateToShow = dateArray[1] + " " + dateArray[2]
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
              shouldShowDate={this.state.shouldShowDate}
            />
          </div>
          )
        })}
      </tbody>
    return (
      <div>
        <div className='full-screen-modal category-title'>
          <ControlLabel className='large-header'>Recent Uploads</ControlLabel>
          <Button bsStyle='link' className='upload-button' onClick={() => forceShowUpload()}>+ New upload </Button>
        </div>
        <PaginatedTable
          fill
          handlePage={(page) => this.setState({ page })}
          itemTotal={parsedHistory.length}
          limit={PAGE_LIMIT}
          page={page}
          tbody={itemsToShow}
        />
      </div>
    )
  }
}

export default RecentUploads