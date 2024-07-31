import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import JsonView from '@uiw/react-json-view';
import { CurrentAnalysisModalProps } from '../Interfaces';

/*
  Display the current analysis of a video stored in the form of json button
    a. on /analysis/{executionArn}
    b. detailed-info/channel_id/video_id
*/

const CurrentAnalysisModal: React.FC<CurrentAnalysisModalProps> = ({ showAnalysisModal, handleAnalysisModalClose, video_title, currentAnalysis }) => {
    return (
        <Modal show={showAnalysisModal} onHide={handleAnalysisModalClose} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{video_title} - Analysis</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <JsonView value={currentAnalysis} enableClipboard={false} displayDataTypes={false} style={{fontSize:'16px'}}/>
          </Modal.Body>
        </Modal>
    );
};

export default CurrentAnalysisModal;
