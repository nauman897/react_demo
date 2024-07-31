import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Button, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ChannelDropdown from '../Dropdown/channelDropdown';
import { listChannelReports, listTemplateSpecificChannelReports } from '../../api/reports';
import { downloadFile } from '../../utils/downloadFile';
import Loader from '../spinner';
import ReportModal from '../Modal/reportModal';
import { ReportInterface } from '../Interfaces';
import { regenerateChannelReportForTemplate } from '../../api/templates';
import { RenderViewReportButton } from '../../pages/Detailed Info/renderReportButton'
import { FiRefreshCw } from 'react-icons/fi';

/*
    Component to render reports on /brand-compass-document
    Lists down the channels which were processed upon the channel, selected from ChannelDropdown, based on channel id
    ReportModal renders the content using a PDF Viewer in /components/Modal/ReportModal 
*/ 

const ViewReports: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Spinner state
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // Refresh reports state
    const [brandCompassDocument, setBrandCompassDocument] = useState<string | undefined>(undefined);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
    const [selectedChannel, setSelectedChannel] = useState<string>('Google For Developers');
    const [selectedChannelId, setSelectedChannelId] = useState<string>('UC_x5XG1OV2P6uZZ5FSM9Ttw');
    const [selectedTemplate, setSelectedTemplate] = useState<ReportInterface | null>(null)
    const [reports, setReports] = useState<ReportInterface[]>([]);

    const fetchChannelReports = async () => {
        try {
            const response = await listChannelReports(selectedChannelId);
            const data = response.data;
            setReports(data.reports);
        } catch (error: any) {
            console.error("Error fetching channel reports", error);
            toast.error("Error fetching channel reports");
        }
    };

    useEffect(() => { 
        setIsSubmitting(true);
        fetchChannelReports().finally(() => setIsSubmitting(false));

        const interval = setInterval(() => {
            setIsRefreshing(true);
            fetchChannelReports().finally(() => setIsRefreshing(false));
        }, 10000);
    
        return () => clearInterval(interval);
    }, [selectedChannel]);

    const handleSelect = async (eventKey: string | null) => {
        if(eventKey){
            const [channelId, channelName] = eventKey.split(':');
            setSelectedChannel(channelName);
            setSelectedChannelId(channelId);
        }
    };

    const fetchReport = async (report: ReportInterface) => {
        if (!selectedChannel) {
            toast.error("Select a channel.");
            return;
        }
        try {
            setIsSubmitting(true);
            const response = await listTemplateSpecificChannelReports(selectedChannelId, report.templateId);
            const data = response.data;
            setBrandCompassDocument(data.markdown_report);
            setPdfUrl(data.pdfReportUrl);
            setShowDocumentModal(true);
            setSelectedTemplate(report);
        } catch (error: any) {
            console.error("Error fetching data from API", error);
            toast.error("Error fetching data from API");
        } finally {
            setIsSubmitting(false);
        }
    };

    const regenerateReport = async (report_id: string) => {
        console.log("Regenrate", report_id);
        try {
            setIsSubmitting(true);
            const response = await regenerateChannelReportForTemplate(selectedChannelId, report_id);
            const data = response.data;
            console.log(data);
            fetchChannelReports();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseDocumentModal = () => {
        setShowDocumentModal(false);
        setBrandCompassDocument('');
        setIsSubmitting(false);
        setSelectedTemplate(null);
    };

    const handleRefreshClick = async () => {
        setIsSubmitting(true);
        await fetchChannelReports();
        setIsSubmitting(false);
    };

    return (
        <Container className="p-4">
            <h1>Reports</h1>
            <Row className="my-5">
                <Col xs="auto" sm="auto" md="auto" lg="auto">
                    <ChannelDropdown onSelect={handleSelect} selectedChannel={selectedChannel} />
                </Col>
                <Col>
                    <Button variant="link" onClick={handleRefreshClick} style={{ marginLeft: '10px' }}>
                        <FiRefreshCw size={24} className={isRefreshing ? 'rotate-animation' : ''} />
                    </Button>
                </Col>
            </Row>

            <Table striped bordered hover className='text-center'>
                <thead>
                    <tr>
                        <th style={{ width: '70%' }}>Title</th>
                        <th style={{ width: '30%' }}>View</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report.templateId}>
                            <td className='align-middle'>{report.title}</td>
                            <td className='align-middle'>
                                <RenderViewReportButton
                                    report_status={report.status}
                                    template={report}
                                    handleShowReportModal={fetchReport}
                                    regenerateReport={regenerateReport}
                                    refreshReports={handleRefreshClick}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <ReportModal
                channelName={selectedChannel}
                 showReport={showDocumentModal}
                 handleClose={handleCloseDocumentModal}
                 brandCompassDocument={brandCompassDocument}
                 channelId={selectedChannelId}
                 template={selectedTemplate}
                 pdfUrl={pdfUrl}
                 downloadFile={downloadFile}
                 fetchAvailableReports={fetchChannelReports}
            />

            {isSubmitting && <Loader />}
        </Container>
    );
};

export default ViewReports;