import React, { Component } from 'react';

import {
  Button,
  ControlLabel,
  Glyphicon,
  Image,
  Modal,
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
    const {
      filename,
      dataset,
      rangeAddress,
      worksheetId,
      toggleShowModal,
      index,
      setItemitemIndexToDelete
    } = this.props;

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
          <div className="icon-border">
            <div className="resync-icon">
              {this.state.loading ? (
                <div className="loader-icon" />
              ) : (
                <div className="actions-container">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip id="tooltip">Delete</Tooltip>}
                  >
                    <Glyphicon
                      glyph="trash"
                      className="icon-delete"
                      onClick={() => {
                        setItemitemIndexToDelete(index);
                        toggleShowModal();
                      }}
                    />
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip id="tooltip">Upload</Tooltip>}
                  >
                    <Image
                      className="icon-upload-blue"
                      src={upload}
                      onClick={() =>
                        this.sync(filename, rangeAddress, dataset, worksheetId)
                      }
                    />
                  </OverlayTrigger>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default class RecentUploads extends Component {
  state = {
    showDeleteModal: false,
    itemIndexToDelete: null
  };

  toggleShowModal = () => {
    const { showDeleteModal } = this.state;

    this.setState({ showDeleteModal: !showDeleteModal });
  };

  setItemitemIndexToDelete = (index) => {
    this.setState({ itemIndexToDelete: index });
  };

  render() {
    const {
      forceShowUpload,
      matchedFiles,
      getSheetName,
      deleteRecentUpload
    } = this.props;
    const { showDeleteModal } = this.state;

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
        {matchedFiles.map((file, index) => {
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
                index={index}
                sync={this.props.sync}
                setError={this.props.setError}
                getSheetName={getSheetName}
                toggleShowModal={this.toggleShowModal}
                setItemitemIndexToDelete={this.setItemitemIndexToDelete}
              />
              <Modal show={showDeleteModal} onHide={this.toggleShowModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Delete Recent Upload?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>Uploaded data will be unaffected.</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button bsSize="small" onClick={this.toggleShowModal}>
                    Cancel
                  </Button>
                  <Button
                    bsSize="small"
                    onClick={() => {
                      const { itemIndexToDelete } = this.state;
                      deleteRecentUpload(matchedFiles[itemIndexToDelete]);

                      this.toggleShowModal();
                    }}
                    bsStyle="danger"
                  >
                    Delete
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          );
        })}
      </div>
    );
  }
}
