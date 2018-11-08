import React, { Component } from 'react';

import { Button, ControlLabel, Image } from 'react-bootstrap';
import Icon from './icons/Icon';
import './DatasetItem.css';

class RecentItem extends Component {
  state = {
    loading: false
  };

  sync = async (filename, rangeAddress, dataset) => {
    this.setState({ loading: true });

    try {
      await this.props.sync(filename, rangeAddress, dataset);
      this.setState({ loading: false });
    } catch (syncError) {
      this.props.setError(syncError);
    }
  };

  render() {
    const { filename, dataset, rangeAddress } = this.props;

    const regexFilter = /^(?:https?:\/\/data\.world\/)?(.*)/;
    const filteredDataset = dataset
      ? dataset.match(regexFilter)[1]
      : 'Undefined';
    const match = filteredDataset.split('/');
    const datasetLocation = `${match[0]}/${match[1]}`;

    const tabular = require('./icons/icon-tabular.svg');

    const rangeToShow = rangeAddress ? rangeAddress : 'Undefined';
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
            onClick={() => this.sync(filename, rangeAddress, dataset)}
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

      matchedFiles
    } = this.props;

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
          return (
            <div>
              <RecentItem
                filename={file.filename}
                dataset={file.dataset}
                rangeAddress={file.rangeAddress}
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
