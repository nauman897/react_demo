import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Col, Row, Button, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../../components/spinner';
import { FiRefreshCw } from 'react-icons/fi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEye } from '@fortawesome/free-solid-svg-icons';
import { FaArrowLeft } from 'react-icons/fa';
import { listAllChannels } from '../../api/channels';
import { listChannelVideos } from '../../api/videos';
import { listTemplateSpecificChannelReports } from '../../api/reports';
import { listTemplates, regenerateChannelReportForTemplate } from '../../api/templates';
import { TrackResponse } from '../../api/posthogAPIMonitoring';
import { listChannelReports } from '../../api/reports';
import { VideoCard } from '../../components/Cards/VideoCardThumbnail';
import { formatDuration, formatNumberWithCommas } from '../../utils/formatFunctions';
import { downloadFile } from '../../utils/downloadFile';
import ReportModal from '../../components/Modal/reportModal';
import { Graph } from '../../components/Graphs';
import { ChannelInterface, ReportInterface, Template, VideoInterface } from '../../components/Interfaces';
import { RenderViewReportButton } from './renderReportButton';
import '../../components/Cards/VideoCardThumbnails.css';

function Channel() {
    const selectedChannel = useParams<{ channel_id: string }>().channel_id;
    const [channels, setChannels] = useState<ChannelInterface[] | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<ReportInterface | null>(null);
    const [channelObject, setChannelObject] = useState<ChannelInterface | null>(null);
    const [channelVideos, setChannelVideos] = useState<VideoInterface[] | null>(null);
    const [channelReports, setChannelReports] = useState<ReportInterface[]>([]);
    const [channelReportsID, setChannelReportsID] = useState<string[]>([]);
    const [allReports, setAllReports] = useState<Template[]>([]);
    const [brandCompassDocument, setBrandCompassDocument] = useState<string | undefined>(undefined);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); //for overall loader on screen
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false); //for refresh on reports
    const [initialLoading, setInitialLoading] = useState(true); // for initial loading when page loads up

    const navigate = useNavigate();

    const fetchAvailableReports = async () => {
        try {
            const response = await listChannelReports(selectedChannel!);
            const data = response.data;
            console.log("reports", data);
            setChannelReports(data.reports);
        } catch (error: any) {
            console.error("Error fetching channel reports", error);
            toast.error("Error fetching channel reports");
        }
    };

    useEffect(() => {
        setIsSubmitting(true);
        const fetchChannel = async () => {
            try {
                const response = await listAllChannels(true);
                TrackResponse(response, 'get/prompts', undefined);
                const data = response.data;
                setChannels(data.channels);
            } catch (error: any) {
                console.error('Error fetching channels from API', error);
            }
        };

        const fetchTemplates = async () => {
            try {
                const response = await listTemplates();
                setAllReports(response.data.templates);
            } catch (error) {
                console.error('Error fetching templates', error);
            }
        };

        fetchChannel();
        fetchAvailableReports();
        fetchTemplates();

        setIsSubmitting(false);
           
        //timeout for loader when the page loads up initially
        const timeout = setTimeout(() => {
            setInitialLoading(false);
        }, 5000);

        const interval = setInterval(() => {
            setIsRefreshing(true);
            fetchAvailableReports().finally(() => setIsRefreshing(false));
        }, 10000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        }
    }, [selectedChannel]);

    useEffect(() => {
        setIsSubmitting(true);
        const fetchSelectedChannel = () => {
            if (channels && selectedChannel) {
                const foundChannel = channels.find((channel: ChannelInterface) => channel.id === selectedChannel);
                if (foundChannel) {
                    setChannelObject(foundChannel);
                }
            }
        };
        fetchSelectedChannel();
        setIsSubmitting(false);
    }, [channels, selectedChannel]);

    useEffect(() => {
        setIsSubmitting(true);
        const fetchData = async () => {
            if (channelObject) {
                try {
                    setIsSubmitting(true);
                    const response = await listChannelVideos(selectedChannel!);
                    TrackResponse(response, `get/channels/videos/${selectedChannel}`, undefined);

                    const data = response.data;
                    console.log("VIDEO : ", data);

                    if (data.videos && Array.isArray(data.videos)) {
                        const formattedVideos = data.videos.map((video: VideoInterface) => {
                            const formattedDuration = formatDuration(video.duration);
                            return {
                                ...video,
                                formattedDuration,
                            };
                        });

                        setChannelVideos(formattedVideos);
                    } else {
                        console.error('Invalid data format:', data);
                    }
                } catch (error: any) {
                    console.error('Error fetching channels from API', error);
                } finally {
                    setTimeout(() => { setIsSubmitting(false); }, 2000);
                }
            }
        };

        fetchData();
        setIsSubmitting(false);
    }, [channelObject, selectedChannel]);

    useEffect(() => {
        const tempReports: string[] = [];
        channelReports.forEach(object => {
            tempReports.push(object.templateId);
        });
        setChannelReportsID(tempReports);
    }, [channelReports]);

    const handleVideoClick = (videoId: string, outlierScore: number) => {
        navigate(`${videoId}`, { state: { outlierScore } });
    };

    const fetchReport = async (report: ReportInterface) => {
        if (!selectedChannel) {
            toast.error("Error");
            return;
        }
        try {
            setIsSubmitting(true);
            const response = await listTemplateSpecificChannelReports(selectedChannel, report.templateId);
            const data = response.data;
            setBrandCompassDocument(data.markdown_report);
            setPdfUrl(data.pdfReportUrl);
            setShowDocumentModal(true);
            setSelectedTemplate(report);
        } catch (error: any) {
            toast.error("Error fetching data from API");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseDocumentModal = () => {
        setShowDocumentModal(false);
        setBrandCompassDocument('');
        setSelectedTemplate(null);
    };

    const regenerateReport = async (report_id: string) => {
        try {
            setIsSubmitting(true);
            const response = await regenerateChannelReportForTemplate(selectedChannel, report_id);
            const data = response.data;
            console.log(data);
            fetchAvailableReports();
        } catch (error: any) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRefreshClick = async () => {
        setIsRefreshing(true);
        fetchAvailableReports().finally(() => setIsRefreshing(false));
    };

    return (
        <Container>
            <FaArrowLeft className="me-2 back" onClick={() => navigate(`/home`)} style={{ cursor: 'pointer' }} />
            {initialLoading ? (
                <Loader />
            ) : (
                <>
                    <Row className='d-flex' style={{ marginTop: '1rem' }}>
                        <Col md={5} sm={12} style={{ margin: '0 10px' }}>
                            <Row className='channel-info'>
                                <Col lg={3}>
                                    <img src={channelObject?.avatarUrl} alt={channelObject?.displayName} className='channel-thumbnail' />
                                </Col>
                                <Col lg={7}>
                                    <div className='channel-details-card'>
                                        <p className='channel-title'>{channelObject?.displayName}</p>
                                        <p className='channel-handle'>@{channelObject?.handle}</p>
                                        <p className='channel-videos'>{channelObject?.videoCount} videos</p>
                                        <p className='processed-videos'>Number of Processed Videos: {channelVideos?.length}</p>
                                    </div>
                                </Col>
                            </Row>

                            <Row className='channel-reports'>
                                <p className='channel-report-heading mt-5'>Channel Reports 
                                    <Button variant="link" onClick={handleRefreshClick} style={{ marginLeft: '10px' }}>
                                        <FiRefreshCw size={24} className={isRefreshing ? 'rotate-animation' : ''} />
                                    </Button>
                                </p>

                                <div style={{ width: '90%' }}>
                                    <Table striped hover>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50%' }}>Title</th>
                                                <th style={{ width: '50%', textAlign: 'center' }} className='align-items-center'>View</th>
                                            </tr>
                                        </thead>
                                        <tbody className='reports-table'>
                                            {channelReports.map((report) => (
                                                <tr key={report.templateId}>
                                                    <td style={{ width: '50%' }}>{report.title}</td>
                                                    <td style={{ width: '50%' }} className='align-items-center text-center'>
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
                                            {
                                            allReports
                                                .filter(report => report.releaseStatus === "released" && !channelReportsID.includes(report.id))
                                                .map(report => (
                                                    <tr key={report.id}>
                                                        <td style={{ width: '50%' }}>{report.title}</td>
                                                        <td style={{ width: '50%' }} className='align-items-center text-center'>
                                                            <Button onClick={() => regenerateReport(report.id)} className='report-btn'>Generate</Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                </div>
                            </Row>
                        </Col>
                        <Col md={6} sm={12} style={{ marginLeft: '10px' }} className='justify-content-between'>
                            <Row>
                                <div className='subs-card'>
                                    <p className='card-title'>Subscribers <FontAwesomeIcon icon={faUser} className='arrow-icon' /></p>
                                    <p className='card-value'>{formatNumberWithCommas(channelObject?.subscriberCount)}</p>
                                </div>
                                <div className='subs-card'>
                                    <p className='card-title'>Total Views <FontAwesomeIcon icon={faEye} className='arrow-icon' /></p>
                                    <p className='card-value'>{formatNumberWithCommas(channelObject?.viewCount)}</p>
                                </div>
                            </Row>
                            <Row>
                                <p className='channel-description'>
                                    {showFullDescription
                                        ? channelObject?.description
                                        : channelObject?.description?.slice(0, 150) + (channelObject?.description && channelObject.description.length > 50 ? '...' : '')}
                                    {channelObject?.description && channelObject.description.length > 50 && (
                                        <span
                                            className='see-more'
                                            onClick={() => setShowFullDescription(!showFullDescription)}
                                            style={{ color: 'blue', cursor: 'pointer' }}
                                        >
                                            {showFullDescription ? ' see less' : ' see more'}
                                        </span>
                                    )}
                                </p>
                            </Row>
                            <Row>
                                <Graph video_id={undefined} channel_id={selectedChannel} />
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <p className='processed-video-heading'>Processed Videos</p>
                        {channelVideos?.map((video, index) => (
                            <VideoCard
                                key={index}
                                video={video}
                                isSelected={false}
                                handleVideoCardClick={() => handleVideoClick(video.id, video.outlierScore)}
                            />
                        ))}
                    </Row>

                    <ReportModal
                        showReport={showDocumentModal}
                        handleClose={handleCloseDocumentModal}
                        brandCompassDocument={brandCompassDocument}
                        channelId={selectedChannel}
                        channelName={channelObject?.displayName}
                        template={selectedTemplate}
                        pdfUrl={pdfUrl}
                        downloadFile={downloadFile}
                        fetchAvailableReports={fetchAvailableReports}
                    />
                    {isSubmitting && <Loader />}
                </>
            )}
        </Container>
    );
}

export default Channel;
