import React, { useState, useEffect } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import MarkdownPreview from '@uiw/react-markdown-preview';
import PDFViewer from '../PDFViewer';
import { ReportInterface, ReportModalProps } from '../Interfaces';
import { listChannelReportsVersion, listPreviousVersionReport } from '../../api/reports';
import { deleteTemplateVersion } from '../../api/templates';
import moment from 'moment';
import { toast } from 'react-toastify';
import { formatTimestamp } from '../../utils/formatFunctions';

/*
    Displays report in the form of a PDF
    showTable is used to display the table for managing selected report version
*/

const ReportModal: React.FC<ReportModalProps> = ({
  showReport,
  handleClose,
  brandCompassDocument,
  channelId,
  channelName,
  template,
  pdfUrl,
  downloadFile,
  fetchAvailableReports
}) => {
  const [reportVersion, setReportVersion] = useState<ReportInterface[]>([]);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [reportPdfUrl, setReportPdfUrl] = useState<string | null>(null);
  const [requestedAt, setRequestedAt] = useState<string | undefined>('')

  useEffect(() => {
    setReportPdfUrl(pdfUrl);
    setRequestedAt(template?.requestedAt)
  }, [pdfUrl, showReport]);

  const extractTemplateVersion = async () => {
    try {
      const response = await listChannelReportsVersion(channelId, template?.templateId);
      const data = response?.data;
      setReportVersion(data.reports);
      setShowTable(!showTable);
    } catch (error: any) {
      console.error('Error fetching channel reports', error);
    }
  };

  const deleteVersion = async (requested_at: string) => {
    try {
      const response = await deleteTemplateVersion(channelId, template?.templateId, requested_at);
      toast.success('Version deleted successfully');
      extractTemplateVersion();
      fetchAvailableReports();
    } catch {
      toast.error('Error deleting the template version');
    }
  };

  const viewPreviousVersion = async (requested_at: string) => {
    try {
      console.log(requestedAt)
      const response = await listPreviousVersionReport(channelId, template?.templateId, requested_at);
      console.log(response);
      const data = response?.data;
      setReportPdfUrl(data.pdfReportUrl);
      setRequestedAt(requested_at);
      setShowTable(false);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log({"url":reportPdfUrl});
  }, [reportPdfUrl]);

  return (
    <div>
      <Modal size="lg" show={showReport} onHide={handleClose} className="document-modal">
        <Modal.Header closeButton className="d-flex justify-content-between w-100">
          <Modal.Title>
              {template?.title}
              <br />
              <small style={{fontSize:'14px', color:'grey'}}><i>Requested At : {formatTimestamp(requestedAt)}</i></small>
          </Modal.Title>
          <div style={{ position: 'absolute', right: '50px' }}>
            <Button
              variant="primary"
              onClick={extractTemplateVersion}
              disabled={!pdfUrl}
              style={{ marginRight: '10px' }}
            >
             { showTable?  'Hide Table' : 'View All Versions'}
            </Button>
            <Button
              variant="success"
              onClick={() => reportPdfUrl && template && downloadFile(reportPdfUrl, `${channelName}-${template.title}-${template.requestedAt}.pdf`)}
              disabled={!reportPdfUrl}
            >
              Download PDF
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body className="text-center">
          {showTable ? (
            <Table striped bordered hover className="text-center justify-content-center align-items-center">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Requested At</th>
                  <th>View</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {reportVersion.map((version, index) => (
                  <tr key={index}>
                    <td>{version.title}</td>
                    <td>{version.status}</td>
                    <td>{moment(version.requestedAt).format('YYYY-MM-DD HH:mm:ss')}</td>
                    <td>
                      <Button variant="primary" onClick={() => viewPreviousVersion(version.requestedAt)}>
                        View
                      </Button>
                    </td>
                    <td>
                      <Button variant="danger" onClick={() => deleteVersion(version.requestedAt)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ): <></>  
        }  
        { reportPdfUrl ? (
              <PDFViewer pdfUrl={reportPdfUrl!} />
          ) : (
            <MarkdownPreview source={brandCompassDocument || ''} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => reportPdfUrl && template && downloadFile(reportPdfUrl, `${channelName}-${template.title}-${template.requestedAt}.pdf`)}
            disabled={!reportPdfUrl}
          >
            Download PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReportModal;
