import React, { useState, useCallback, useEffect } from 'react';
import { Container, Table, Button, Modal, Spinner, Dropdown, DropdownButton } from 'react-bootstrap';
import { listTemplates, deleteSelectedTemplate, listReportResponse, postReportRequest, releaseTemplate } from '../../api/templates';
import { listAllChannels } from '../../api/channels';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FiRefreshCw } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../components/spinner';
import { TrackResponse } from '../../api/posthogAPIMonitoring';
import './index.css';
import DeleteModal from "../../components/Modal/deleteModal"
import { Template } from '../../components/Interfaces';
import { RenderTestButton, RenderReleaseButton } from './buttons';
import { ChannelInterface } from '../../components/Interfaces';
import { downloadFile } from '../../utils/downloadFile';


const TemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [channels, setChannels] = useState<ChannelInterface[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState<boolean>(false);
  const [templateToRelease, setTemplateToRelease] = useState<Template | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Spinner state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // Refresh icon state
  const navigate = useNavigate();

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await listTemplates();
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const response = await listAllChannels(false);
      
      TrackResponse(response, `get/prompts`, undefined);

      console.log("RESPONSE : ",response);

      let data = response.data.channels;
      data = data.sort((c1: any, c2: any) => c1.displayName.localeCompare(c2.displayName));
      setChannels(data);
    } catch (error: any) {
      console.error("Error fetching channels from API", error);
    }
  }, []);

  useEffect(() => {
    setIsSubmitting(true);
    Promise.all([fetchTemplates(), fetchData()])
      .finally(() => setIsSubmitting(false))

    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchTemplates().finally(() => setIsRefreshing(false));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await fetchTemplates();
    setIsRefreshing(false);
  };

  
  const submitRequest = useCallback(async (template: Template, channelId: string) => {
    const request_data = { channelId };
    console.log(request_data);

    try {
      setIsSubmitting(true);
      const response = await postReportRequest(template.id, request_data);
      
      TrackResponse(response, `post/report-builder/test`, request_data);

      console.log(response);

      if (response.status === 200) {
        toast.success("Request submitted successfully!");
        fetchTemplates();
      } else {
        toast.error("Error submitting request!");
      }
    } catch (error) {
      toast.error("Error submitting request!");
      console.error('Error submitting request', error);
    } finally {
      setIsSubmitting(false); 
    }
  }, []);

  const handleShowDeleteModal = (template: Template) => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  };

  const handleDelete = async (deleteFromChannels: boolean) => {
    if (templateToDelete) {
      try {
        setIsSubmitting(true);

        const response = await deleteSelectedTemplate(templateToDelete.id, deleteFromChannels);

        TrackResponse(response, `delete/report-builder`, { templateToDelete, deleteFromChannels });

        fetchTemplates();
        toast.success("Template deleted successfully");
      } catch (error) {
        console.error('Error deleting template', error);
        toast.error('Error deleting template');
      } finally {
        handleCloseDeleteModal();
        setIsSubmitting(false);
      }
    }
  };

  const fetchTemplateResponse = async (template_key: string) => {
    if (template_key) {
      try {
        console.log("Template", template_key)
        setIsSubmitting(true);
        const response = await listReportResponse(template_key);
        
				TrackResponse(response, `get/report-builder/${template_key}`, undefined);
        
        const data = response.data;
        console.log(data);
        return data;
      } catch (error) {
        console.error('Error retrieving report', error);
        toast.error('Error retrieving report');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdate = (template: Template) => {
    navigate('/update-template', { state: { template } });
  };

  const handleAddNewTemplate = () => {
    navigate('/add-template');
  };

  const handleChannelSelect = (eventKey: string | null, template: Template) => {
    if (eventKey) {
      submitRequest(template, eventKey);
    }
  };

  const handleShowReleaseModal = (template: Template) => {
    setTemplateToRelease(template);
    setShowReleaseModal(true);
  };

  const handleReleaseTemplate = async () => {
    if (templateToRelease) {
      const response = await releaseTemplate(templateToRelease.id);
      const data = response.data;
      console.log(data);
      setShowReleaseModal(false);
      setTemplateToRelease(null);
      fetchTemplates();
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    navigate('/duplicate-template', { state: { template } });
  };

  return (
    <Container>
      <ToastContainer />
      <div className="d-flex align-items-center mb-3">
        <h1>Report Prompts</h1>
        <Button variant="link" onClick={handleRefreshClick} style={{ marginLeft: '10px' }}>
          <FiRefreshCw size={24} className={isRefreshing ? 'rotate-animation' : ''} />
        </Button>
      </div>
      <Button onClick={handleAddNewTemplate} className="mb-3">Add New Template</Button>
      <Table striped bordered hover className='text-center'>
        <thead>
          <tr>
            <th style={{ width: '20%' }}>Title</th>
            <th style={{ width: '10%' }}>Update</th>
            <th style={{ width: '10%' }}>Delete</th>
            <th style={{ width: '10%' }}>Duplicate</th>
            <th style={{ width: '25%' }}>Test Status</th>
            <th style={{ width: '25%' }}>Publish Status</th>
          </tr>
        </thead>
        <tbody>
          {templates.map(template => (
            <tr key={template.id}>
              <td className='align-middle' style={{ width: '20%' }}>{template.title}</td>
              <td className='align-middle' style={{ width: '10%' }}>
                <Button onClick={() => handleUpdate(template)} variant="warning"
                  disabled={template.releaseStatus === 'releasing'}>
                  Update
                </Button>
              </td>
              <td className='align-middle' style={{ width: '10%' }}>
                <Button onClick={() => handleShowDeleteModal(template)} variant="danger"
                  disabled={template.releaseStatus === 'releasing'}>
                  Delete
                </Button>
              </td>
              <td className='align-middle' style={{ width: '10%' }}>
                <Button onClick={() => handleDuplicateTemplate(template)} variant="primary">
                  Duplicate
                </Button>
              </td>
              <td className='align-middle' style={{ width: '25%' }}>
                <RenderTestButton
                  template={template}
                  channels={channels}
                  handleChannelSelect={handleChannelSelect}
                  fetchTemplateResponse={fetchTemplateResponse}
                  downloadFile={downloadFile}
                />
              </td>
              <td className='align-middle' style={{ width: '25%' }}>
                <RenderReleaseButton
                  release_stat={template.releaseStatus}
                  template={template}
                  handleShowReleaseModal={handleShowReleaseModal}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <DeleteModal
        showDeleteModal={showDeleteModal}
        handleCloseDeleteModal={handleCloseDeleteModal}
        handleDelete={handleDelete}
        template_title={templateToDelete?.title}
      />
        

      <Modal show={showReleaseModal} onHide={() => setShowReleaseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Release</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to publish the template <strong>{templateToRelease?.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReleaseModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleReleaseTemplate}>
            Publish
          </Button>
        </Modal.Footer>
      </Modal>
      {isSubmitting && (
        <Loader />
      )}
    </Container>
  );
};

export default TemplateList;
