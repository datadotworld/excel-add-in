import React, { Component } from 'react';

import { 
  Button,
  ControlLabel
} from 'react-bootstrap';
import analytics from '../analytics';
import PaginatedTable from './PaginatedTable'
import Icon from './icons/Icon';
import './DatasetItem.css';

const { localStorage } = window;
const PAGE_LIMIT = 2

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
  componentDidMount() {
    this.props.manageDates(this.props.dateToShow)
  }

  render() {
    const { filename, dataset, range, sheetId, key, dateToShow, shouldShowDate, manageDates } = this.props
    const regexMatch = /https:\/\/data\.world\/(.*)\/(.*)/

    const match = dataset.match(regexMatch)
    const rangeToShow = range ? range : 'Undefined'
    const datasetSlug = `=${rangeToShow} > ${match[1]}/${match[2]}`

    return (
      <div>
        {/* {shouldShowDate && <h4>{dateToShow}</h4>} */}
        <div className='dataset'>
        <Icon icon='datasetSchema'/>
        <div className='center-info'>
          <div className='title'>{filename}</div>
          <div className='info'>{datasetSlug}</div>
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

  manageDates = async (dateToShow) => {
    console.log("datetoshow", dateToShow)
    console.log("previous date", this.state.previousDate)
    if (dateToShow === this.state.previousDate) {
      await this.setState({shouldShowDate: false}) 
      console.log("in here")
    } else {
      await this.setState({
        shouldShowDate: true,
        previousDate: dateToShow
      }, () => console.log("previous date after setting", this.state.previousDate))
    }
  }

  render () {
    const { forceShowUpload, createBinding, sync } = this.props
    const { page } = this.state
    const parsedHistory = JSON.parse(localStorage.getItem('history')).reverse()
    const test = <tbody>
      {parsedHistory.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT).map((entry, index) => {
        const parsedEntry = JSON.parse(Object.values(JSON.parse(entry))[0])
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
              manageDates={this.manageDates}
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
          tbody={test}
        />
      </div>
    )
  }
}

export default RecentUploads