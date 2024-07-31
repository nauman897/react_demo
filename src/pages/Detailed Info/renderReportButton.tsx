import React from 'react';
import { Button } from 'react-bootstrap';
import { ReportInterface } from '../../components/Interfaces';

interface ViewReportProps {
  report_status: string;
  template: ReportInterface;
  handleShowReportModal: (template: ReportInterface) => void;
  regenerateReport: (template_id: string) => void;
  refreshReports : () => void;
}

export const RenderViewReportButton: React.FC<ViewReportProps> = ({
  report_status,
  template,
  handleShowReportModal,
  regenerateReport,
  refreshReports
}) => {
  const handleRegenerateClick = async (templateID: string) => {
    await regenerateReport(templateID);
    await refreshReports();
  };

  if (report_status === 'null') {
    return (
      <div>
        <Button className='report-btn' variant='secondary'>Queued</Button>
      </div>
    );
  } else if (report_status === 'processing') {
    return <Button className='report-btn' variant='info'>Processing</Button>;
  } else if (report_status === 'completed') {
    return (
      <div>
        <Button className='report-btn' variant='primary' onClick={() => handleShowReportModal(template)}>View</Button>
        <Button className='report-btn' variant='success' onClick={() => handleRegenerateClick(template.templateId)}>Regenerate</Button>
      </div>
    );
  } else if (report_status === 'failed') {
    return (
      <div>
        <Button className='report-btn' variant='danger'>Failed</Button>
        <Button className='report-btn' variant='success' onClick={() => handleRegenerateClick(template.templateId)}>Regenerate</Button>
      </div>
    );
  } else {
    return null;
  }
};
