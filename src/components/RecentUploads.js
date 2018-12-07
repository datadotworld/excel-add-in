import React, { Component } from 'react';

import {
  Button,
  ControlLabel,
  Image,
  Tooltip,
  OverlayTrigger
} from 'react-bootstrap';
import { getDisplayRange } from '../util';
import './RecentUploads.css';

const upload = require('./icons/icon-upload-blue.svg');

class RecentItem extends Component {
  state = {
    loading: false,
    sheetName: ''
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

  componentDidMount() {
    this.props.getSheetName(this.props.worksheetId).then((sheetName) => {
      this.setState({ sheetName });
    });
  }

  render() {
    const { filename, dataset, rangeAddress, worksheetId } = this.props;

    const datasetLocation = `${dataset.owner}/${dataset.id}`;

    const rangeToShow = getDisplayRange(rangeAddress, this.state.sheetName);
    return (
      <div>
        <div className="item recent">
          <div className="recents-item-text">
            <div>
              <div className="recent-uploads-filename">{filename}</div>
            </div>
            <a
              href={`https://data.world/${datasetLocation}/workspace/file?filename=${filename}`}
              target="_blank"
              className="link button-link"
            >
              <div className="recent-uploads-dataset">{datasetLocation}</div>
            </a>
            <div className="info">{`Upload from: ${rangeToShow}`}</div>
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
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip id="tooltip">Upload</Tooltip>}
                >
                  <Image className="icon-upload-blue" src={upload} />
                </OverlayTrigger>
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
    const { forceShowUpload, matchedFiles, getSheetName } = this.props;

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
                getSheetName={getSheetName}
              />
            </div>
          );
        })}
      </div>
    );
  }
}
