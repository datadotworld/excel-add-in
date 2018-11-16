import React, { Component } from 'react';

import { Button, ControlLabel, Image } from 'react-bootstrap';
import { getDisplayRange } from '../util';
import Icon from './icons/Icon';
import './RecentUploads.css';

class RecentItem extends Component {
  state = {
    loading: false
  };

  sync = async (filename, rangeAddress, dataset, worksheetId) => {
    this.setState({ loading: true });

    try {
      await this.props.sync(filename, rangeAddress, dataset, worksheetId);
      this.setState({ loading: false });
    } catch (syncError) {
      this.props.setError(syncError);
    }
  };

  render() {
    const { filename, dataset, rangeAddress, worksheetId } = this.props;

    const regexFilter = /^(?:https?:\/\/data\.world\/)?(.*)/;
    const filteredDataset = dataset
      ? dataset.match(regexFilter)[1]
      : 'Undefined';
    const match = filteredDataset.split('/');
    const datasetLocation = `${match[0]}/${match[1]}`;

    const tabular = require('./icons/icon-tabular.svg');

    const rangeToShow = getDisplayRange(rangeAddress);
    const datasetSlug = `=${rangeToShow}`;
    return (
      <div>
        <div className="item recent">
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
            onClick={() =>
              this.sync(filename, rangeAddress, dataset, worksheetId)
            }
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
    const { forceShowUpload, matchedFiles } = this.props;

    let previousDate = '';
    let showDate;

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
        {matchedFiles.map((file) => {
          const dateArray = new Date(file.date).toDateString().split(' ');
          let dateToShow = dateArray[1] + ' ' + dateArray[2];
          if (dateToShow !== previousDate) {
            previousDate = dateToShow;
            showDate = true;
          } else {
            showDate = false;
          }

          return (
            <div key={file.filename}>
              {showDate && <div className="date">{dateToShow}</div>}
              <RecentItem
                {...file}
                sync={this.props.sync}
                setError={this.props.setError}
              />
            </div>
          );
        })}

        <div className="category-reminder">
          Showing {matchedFiles.length} most recent uploads
        </div>
      </div>
    );
  }
}
