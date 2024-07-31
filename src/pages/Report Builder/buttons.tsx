import React, {useCallback, useState} from 'react';
import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { Template } from '../../components/Interfaces'; 
import { ChannelInterface } from '../../components/Interfaces';
import PDFViewer from '../../components/PDFViewer';
import './index.css'

interface ButtonProps {
  template: Template;
  channels: ChannelInterface[];
  handleChannelSelect: (eventKey: string | null, template: Template) => void;
  fetchTemplateResponse: (templateId: string) => Promise<any>;
	downloadFile: (url: string, filename: string) => void
}

interface ReleaseButtonProps {
  release_stat: string;
  template: Template;
  handleShowReleaseModal: (template: Template) => void;
}

export const RenderTestButton: React.FC<ButtonProps> = ({
  template,
  channels,
  handleChannelSelect,
  fetchTemplateResponse,
  downloadFile,
}) => {
  const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [viewChannelName, setViewChannelName] = useState<string>('');

  const handleViewClick = useCallback(() => {
    fetchTemplateResponse(template.id).then(data => {
      setViewChannelName(data.testedChannelName);
      setPdfUrl(data.testResultsPdfUrl);
      setShowDocumentModal(true);
    });
  }, [template]);

  const handleCloseDocumentModal = useCallback(() => {
    setShowDocumentModal(false);
  }, []);

  if (template.testStatus === 'not_initiated') {
    return (
      <div className='d-flex align-items-center text-center justify-content-center'>
        <DropdownButton
          id="dropdown-basic-button"
          title="Test"
          variant="primary"
          onSelect={(eventKey) => handleChannelSelect(eventKey, template)}
        >
          <div className='dropdown-list'>
          {channels.map(channel => (
            
              <Dropdown.Item eventKey={channel.id} key={channel.id} style={{ marginLeft: 0 }}>
                {channel.displayName}
              </Dropdown.Item>
          ))}
          </div>
        </DropdownButton>
      </div>
    );
  } else if (template.testStatus === 'running') {
    return <Button variant="info" disabled>Running</Button>;
  } else if (template.testStatus === 'failed') {
    return (
      <div className='d-flex align-items-center text-center justify-content-center'>
        <DropdownButton
          id="dropdown-basic-button"
          title="Test"
          variant="primary"
          onSelect={(eventKey) => handleChannelSelect(eventKey, template)}
        >
          <div className='dropdown-list'>
          {channels.map(channel => (
            <Dropdown.Item eventKey={channel.id} key={channel.id} style={{marginLeft : 0}}>{channel.displayName}</Dropdown.Item>
          ))}
          </div>
          
        </DropdownButton>
        <Button variant="danger" className='mx-3'>Rerun</Button>
      </div>
    );
  } else if (template.testStatus === 'completed') {
    return (
      <div className='d-flex align-items-center text-center justify-content-center'>
        <DropdownButton
          id="dropdown-basic-button"
          title="Test"
          variant="primary"
          onSelect={(eventKey) => handleChannelSelect(eventKey, template)}
        >
          <div className='dropdown-list'>
          {channels.map(channel => (
              <Dropdown.Item eventKey={channel.id} key={channel.id}  style={{ marginLeft: 0 }}>
                {channel.displayName}
              </Dropdown.Item>
          ))}
          </div>
        </DropdownButton>
        <Button variant="success" onClick={handleViewClick} className='mx-3'>View Results</Button>
        <Modal size="lg" show={showDocumentModal} onHide={handleCloseDocumentModal} className='document-modal'>
          <Modal.Header closeButton>
            <Modal.Title>{viewChannelName} Report</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {<PDFViewer pdfUrl={pdfUrl} />}
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseDocumentModal}>
              Close
            </Button>
            <Button variant='primary' onClick={() => downloadFile(pdfUrl, `${template.title}-${viewChannelName}-test.pdf`)}>
              Download PDF
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  } else {
    return null; 
  }
};

export const RenderReleaseButton: React.FC<ReleaseButtonProps> = ({
  release_stat,
  template,
  handleShowReleaseModal,
}) => {
  if (release_stat === 'draft') {
    return (
      <div>
        <Button variant='secondary' disabled>Draft</Button>
        <Button className='mx-2' variant='primary' onClick={() => handleShowReleaseModal(template)}>Publish</Button>
      </div>
    );
  } else if (release_stat === 'releasing') {
    return <Button variant='info' disabled>Publishing</Button>;
  } else if (release_stat === 'released') {
    return <Button variant='success' disabled>Published</Button>;
  } else {
    return null;
  }
};
