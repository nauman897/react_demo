import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Pagination } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faThumbsUp, faCalendarAlt, faCalendarCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { currentVideoAnalysis, listVideoDetails } from '../../api/videos';
import Loader from '../../components/spinner';
import { Graph } from '../../components/Graphs';
import { getVideoStats } from '../../components/Graphs/data';
import { formatDate, formatDuration, formatNumberWithCommas } from '../../utils/formatFunctions';
import { downloadJSONAnalysis } from '../../utils/downloadFile';
import { VideoInterface, VideoStatInterface } from '../../components/Interfaces';
import { TrackResponse } from '../../api/posthogAPIMonitoring';
import CurrentAnalysisModal from '../../components/Modal/currentAnalysisModal'
import '../../components/Cards/VideoCardThumbnails.css';


function Video() {
  const selectedChannel = useParams<{ channel_id: string }>().channel_id;
  const selectedVideo = useParams<{ video_id: string }>().video_id;
  const [extractedVideo, setExtractedVideo] = useState<VideoInterface | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<object | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState<VideoStatInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  const navigate = useNavigate();
  const location = useLocation();
  const outlierScore = location.state?.outlierScore ? location.state.outlierScore.toFixed(2) : '0.00';

  useEffect(() => {
    const fetchData = async () => {
      if (selectedChannel) {
        try {
          setIsSubmitting(true);
          const response = await listVideoDetails(selectedVideo);
          const data = response.data;
          console.log(data);
          setExtractedVideo(data);

          //get table stats
          const stats = await getVideoStats(selectedVideo);
          setTableData(stats);
        } catch (error: any) {
          console.error('Error fetching channels from API', error);
        } finally {
          setTimeout(() => {
            setIsSubmitting(false);
          }, 1000);
        }
      }
    };
    fetchData();
  }, [selectedChannel, selectedVideo]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  useEffect(() => {
    const getCurrentAnalysis = async () => {
      try {
        setIsSubmitting(true);
        const response = await currentVideoAnalysis(selectedVideo);
        TrackResponse(response, 'get/channel/video/analysis', undefined);
        const data = response.data;
        setCurrentAnalysis(data);
      } catch (error: any) {
        console.error('Error fetching channels from API', error);
      } finally {
        setIsSubmitting(false);
      }
    };
    getCurrentAnalysis();
  }, [selectedChannel, selectedVideo]);

  
  const handleShowAnalysis = () => {
    if (currentAnalysis) {
      handleShow();
    } else {
      toast.error('No video analysis is available');
    }
  };

  const extractMaxResUrl = (thumbnailsString : string | undefined) => {
    if(thumbnailsString){
        try {
          const thumbnails = JSON.parse(thumbnailsString.replace(/'/g, '"'));
          return thumbnails.maxres.url;
        } catch (error) {
          console.error('Error parsing thumbnails:', error);
          return null;
        }
    }
    else return null;
  };

  const renderPaginationItems = () => {
    const pageNumbers = [];
    const pageRange = 2; 
    const startPage = Math.max(currentPage - pageRange, 1);
    const endPage = Math.min(currentPage + pageRange, totalPages);

    if (startPage > 1) {
      pageNumbers.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        pageNumbers.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
          {i}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      pageNumbers.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return pageNumbers;
  };

  // download JSON Analysis
  const handleDownloadClick: React.MouseEventHandler<HTMLButtonElement> = () => {
      downloadJSONAnalysis(currentAnalysis, extractedVideo?.title, selectedChannel);
  };

  return (
    <Container>
      <FaArrowLeft className="me-2 back" onClick={() => navigate(`/channel-details/${selectedChannel}`)} style={{ cursor: 'pointer' }} />
      <Row style={{ marginTop: '1rem' }}>
        <Col lg={4} md={4} sm={12} style={{ margin: '0 10px' }}>
          <Row>
            <div className='thumbnail-img-container'>
              <img src={extractedVideo?.thumbnails?.maxres?.url || extractedVideo?.thumbnails?.high?.url || ""} alt={extractedVideo?.title} className='video-thumbnail' />
            </div>
          </Row>

          <Row>
            <p className='video-title'>{extractedVideo?.title}</p>
            <p className='outlier-score'>Outlier Score : <span>x{outlierScore}</span></p>
            <p>
              {showFullDescription
                ? extractedVideo?.description
                : extractedVideo?.description?.slice(0, 150) + (extractedVideo?.description && extractedVideo.description.length > 50 ? '...' : '')}
              {extractedVideo?.description && extractedVideo.description.length > 50 && (
                <span
                  className='see-more'
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  style={{ color: 'blue', cursor: 'pointer' }}
                >
                  {showFullDescription ? ' see less' : ' see more'}
                </span>
              )}
            </p>
            <span>
              <FontAwesomeIcon className="icon" icon={faClock} /> {formatDuration(extractedVideo?.duration)}
            </span>
            <span>
              <FontAwesomeIcon className="icon" icon={faCalendarAlt} /> Released: {formatDate(extractedVideo?.publishedAt)}
            </span>
            <span>
              <FontAwesomeIcon className="icon" icon={faCalendarCheck} />Last Processed: {formatDate(extractedVideo?.processedAt)}
            </span>
          </Row>
          <Row>
            <Button className='current-analysis-heading' onClick={handleShowAnalysis}>Show Current Analysis</Button>
            <Button className='current-analysis-heading' 
                onClick={handleDownloadClick} variant='success'>
              Download Current Analysis
            </Button>
          </Row>
        </Col>
        <Col lg={1}></Col>
        <Col md={6} sm={12} className='justify-content-end'>
          <Row>
            <div className='likes-card'>
              <p className='card-title'>Total Views <FontAwesomeIcon icon={faEye} className='arrow-icon' /></p>
              <p className='card-value'>{formatNumberWithCommas(extractedVideo?.viewCount)}</p>
            </div>
            <div className='views-card'>
              <p className='card-title'>Total Likes <FontAwesomeIcon icon={faThumbsUp} className='arrow-icon' /></p>
              <p className='card-value'>{formatNumberWithCommas(extractedVideo?.likeCount)}</p>
            </div>
          </Row>
          <Row className='graph'>
            <Graph video_id={selectedVideo} channel_id={selectedChannel} />
          </Row>
          <Row>
            <Table striped hover className='analytics-table'>
              <thead className='text-center'>
                <tr>
                  <th style={{ width: '40%' }}>Date</th>
                  <th style={{ width: '30%' }}>View Count</th>
                  <th style={{ width: '30%' }}>Like Count</th>
                </tr>
              </thead>
              <tbody className='text-center'>
                {currentItems && currentItems.map((item, index) => (
                  <tr key={index}>
                    <td style={{ width: '40%' }}>{item.date}</td>
                    <td style={{ width: '30%' }}>{formatNumberWithCommas(item.viewCount)}</td>
                    <td style={{ width: '30%' }}>{formatNumberWithCommas(item.likeCount)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination className='justify-content-center'>
              <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
              {renderPaginationItems()}
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </Row>
        </Col>

        <CurrentAnalysisModal 
          showAnalysisModal = {showModal} 
          handleAnalysisModalClose = {handleClose}
          video_title = {extractedVideo?.title}
          currentAnalysis = {currentAnalysis}
        />
      </Row>
      {isSubmitting && <Loader />}
    </Container>
  );
}

export default Video;