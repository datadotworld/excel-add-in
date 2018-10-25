import React, { Component } from 'react';

import { Button, ControlLabel, Image } from 'react-bootstrap';
import Icon from './icons/Icon';
import './DatasetItem.css';

class RecentItem extends Component {
  state = {
    loading: false
  };

  submitBinding = async (filename, sheetId, range) => {
    this.setState({ loading: true });
    const {
      createBinding,
      refreshLinkedDataset,
      sync,
      setError,
      addUrl,
      dataset
    } = this.props;
    const selection = {
      name: filename,
      sheetId: sheetId,
      range: range
    };
    addUrl(dataset);
    try {
      const binding = await createBinding(selection);
      await sync(binding);
      await refreshLinkedDataset();
      this.setState({ loading: false });
    } catch (syncError) {
      setError(syncError);
    }
  };

  render() {
    const { filename, dataset, range, sheetId } = this.props;

    const regexFilter = /^(?:https?:\/\/data\.world\/)?(.*)/;
    const filteredDataset = dataset
      ? dataset.match(regexFilter)[1]
      : 'Undefined';
    const match = filteredDataset.split('/');
    const datasetLocation = `${match[0]}/${match[1]}`;

    const tabular = require('./icons/icon-tabular.svg');

    const rangeToShow = range ? range : 'Undefined';
    const datasetSlug = `=${rangeToShow}`;
    return (
      <div>
        <div className="dataset recent">
          <Image className="tabular-icon" src={tabular} />
          <div className="center-info">
            <div>
              <div className="title">{filename}</div>
            </div>
            <div className="info">{datasetSlug}</div>
            <a
              href={`https://data.world/${datasetLocation}/workspace/file?filename=${filename}`}
              target="_blank"
              className="link button-link"
            >
              <div className="info">{datasetLocation}</div>
            </a>
          </div>
          <div
            className="icon-border"
            onClick={() => this.submitBinding(filename, sheetId, range)}
          >
            <div className="resync-icon">
              {this.state.loading ? (
                <div className="loader-icon" />
              ) : (
                <Icon icon="sync" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default class RecentUploads extends Component {
  render() {
    const {
      forceShowUpload,
      createBinding,
      refreshLinkedDataset,
      sync,
      setError,
      user,
      workbook,
      matchedFiles
    } = this.props;
    let previousDate = '';
    let showDate = true;
    return (
      <div>
        <div className="full-screen-modal category-title">
          <ControlLabel className="large-header">Recent Uploads</ControlLabel>
          <Button
            bsStyle="link"
            className="upload-button"
            onClick={() => forceShowUpload()}
          >
            + New upload{' '}
          </Button>
        </div>
        {matchedFiles &&
          matchedFiles.slice(0, 10).map((entry, index) => {
            const parsedEntry = JSON.parse(
              Object.keys(JSON.parse(entry)).map(
                (key) => JSON.parse(entry)[key]
              )[0]
            );
            if (
              parsedEntry.userId === user &&
              parsedEntry.workbook === workbook
            ) {
              const dateArray = new Date(parsedEntry.date)
                .toDateString()
                .split(' ');
              let dateToShow = dateArray[1] + ' ' + dateArray[2];
              if (dateToShow !== previousDate) {
                previousDate = dateToShow;
                showDate = true;
              } else {
                showDate = false;
              }
              return (
                <div key={index}>
                  {showDate && <div className="date">{dateToShow}</div>}
                  <RecentItem
                    filename={parsedEntry.filename}
                    dataset={parsedEntry.dataset}
                    bindingInfo={parsedEntry.bindingInfo}
                    sheetId={parsedEntry.sheetId}
                    range={parsedEntry.range}
                    createBinding={createBinding}
                    refreshLinkedDataset={refreshLinkedDataset}
                    sync={sync}
                    setError={setError}
                    addUrl={this.props.addUrl}
                  />
                </div>
              );
            } else {
              return null;
            }
          })}
        <div className="category-reminder">
          Showing {matchedFiles.length} most recent uploads
        </div>
      </div>
    );
  }
}
