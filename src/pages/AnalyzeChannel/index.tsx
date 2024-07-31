import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Accordion, Pagination } from 'react-bootstrap';
import PromptCheckbox from '../../components/PromptCheckbox';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { listAllPrompts } from '../../api/prompts';
import { createAnalysisExecution, checkIfChannelIngested, getVideo, getChannelVideos, getChannelVideosWithFilters, ingestChannel } from '../../api/analysis';
import Loader from '../../components/spinner';
import { TrackResponse } from '../../api/posthogAPIMonitoring';
import { PromptDict } from '../../components/Interfaces';
import { VideoCard } from '../../components/Cards/VideoCardThumbnail';
import './index.css';

const AnalyzeChannel: React.FC = () => {
    const [prompts, setPrompts] = useState<PromptDict[]>([]);
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
    const [url, setUrl] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [sortCriteria, setSortCriteria] = useState<string>('viewCount');
    const [sortOrder, setSortOrder] = useState<string>('desc');
    const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
    const [channelID, setChannelID] = useState<string>('');
    const [totalVideo, setTotalVideo] = useState<number>(0)
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const navigate = useNavigate();
    const videosPerPage = 20;
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsSubmitting(true);
                const response = await listAllPrompts();

                TrackResponse(response, 'get/prompts', undefined);

                const data = response.data.prompts;
                const fetchedPrompts: PromptDict[] = data.map((item: PromptDict) => ({
                    id: item.id,
                    value: item.prompt,
                    title: item.title,
                }));

                setPrompts(fetchedPrompts);
                setSelectedPrompts(fetchedPrompts.map(prompt => prompt.id));
            } catch (error: any) {
                TrackResponse({ status: 400, message: 'Error' }, 'get/prompts', undefined);
                console.error('Error fetching prompts from API', error);
            } finally {
                setIsSubmitting(false);
            }
        };
        fetchData();
    }, []);

    const handleCheckboxChange = (prompt_id: string) => {
        setSelectedPrompts(prevSelectedPrompts => 
            prevSelectedPrompts.includes(prompt_id)
                ? prevSelectedPrompts.filter(id => id !== prompt_id)
                : [...prevSelectedPrompts, prompt_id]
        );
    };

    const handleSelectDeselectAll = () => {
        if (selectedPrompts.length === prompts.length) {
            setSelectedPrompts([]);
        } else {
            setSelectedPrompts(prompts.map(prompt => prompt.id));
        }
    };

    const handleVideoCardClick = (videoId: string, index: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const newSelectedVideos = [...selectedVideos];

            for (let i = start; i <= end; i++) {
                if (!newSelectedVideos.includes(filteredVideos[i].id)) {
                    newSelectedVideos.push(filteredVideos[i].id);
                }
            }
            setSelectedVideos(newSelectedVideos);
        } else {
            setSelectedVideos((prevSelectedVideos) =>
                prevSelectedVideos.includes(videoId)
                    ? prevSelectedVideos.filter((id) => id !== videoId)
                    : [...prevSelectedVideos, videoId]
            );
        }
        setLastSelectedIndex(index);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!url) {
            toast.error('Video URL cannot be empty');
            return;
        }

        if ((startDate && !endDate) || (!startDate && endDate)) {
            toast.error('Both start date and end date should be present or none');
            return;
        }

        if (startDate && endDate && startDate > endDate) {
            toast.error('Start date must be before end date');
            return;
        }

        const requestData = {
            channelId: channelID,
            selectedPrompts: selectedPrompts,
            videoIds: selectedVideos
        };

        console.log(channelID);        
        console.log(selectedVideos);
        console.log(selectedPrompts);

        try {
            setIsSubmitting(true);
            const response = await createAnalysisExecution(requestData);
            TrackResponse(response, 'post/channels/analysis', requestData);
            // success
            toast.success('Request submitted successfully');
            navigate('/analysis-executions');
        } catch (error: any) {
            console.error('Error posting data to API', error);
            toast.error('Invalid channel URL provided.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const applyFiltersWithPageReset = async () => {
        try {
            setIsSubmitting(true);
            const response = await getChannelVideosWithFilters(channelID, searchQuery, endDate, startDate, sortOrder, sortCriteria, currentPage);
            setFilteredVideos(response.data.videos);
            setTotalVideo(response.data.total);
        } catch {
            console.log("error");
        } finally {
            setCurrentPage(1);
            setTimeout(() => { setIsSubmitting(false); }, 2000);
        }
    };

    const applyFilters = async () => {
        try {
            setIsSubmitting(true);
            const response = await getChannelVideosWithFilters(channelID, searchQuery, endDate, startDate, sortOrder, sortCriteria, currentPage);
            setFilteredVideos(response.data.videos);
            setTotalVideo(response.data.total);
        } catch {
            console.log("error");
        } finally {
            setTimeout(() => { setIsSubmitting(false); }, 2000);
        }
    };

    //update current page to 1 if any other state other than current page changes
    useEffect(() => {
        applyFiltersWithPageReset();
    }, [searchQuery, startDate, endDate, sortOrder, sortCriteria]);

    useEffect(() => {
        applyFilters();
    },[currentPage])

    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const extractHandle = (channel_url: string | null) => {
        if (channel_url) {
            const match = channel_url.match(/@([^/]+)/);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    const extractVideoId = (video_url: string | null) => {
        if (video_url) {
            const match = video_url.match(/\?v=([^/]+)/);
            if (match) {
                return match[1];
            }
        }
        toast.error("Invalid video URL provided.");
        return null;
    }

    const processChannelIngestion = async (channel_id: string) => {
        try {
            setIsSubmitting(true);
            const response = await ingestChannel(channel_id);
            console.log(response);
        } catch (error: any) {
            console.log(error.data);
        }
    }

    const fetchChannelVideosArray = async (channel_id: string) => {
        try {
            console.log(channel_id);
            setIsSubmitting(true);
            const response = await getChannelVideos(channel_id);
            console.log(response);
            setFilteredVideos(response.data.videos);
            setTotalVideo(response.data.total);
            console.log(response);
        } catch (error: any) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const fetchChannelVideos = async () => {
        if (url) {
            try {
                console.log(isSubmitting);
                setIsSubmitting(true);
                const response = await checkIfChannelIngested(extractHandle(url));
                console.log(response.data);
                const newChannelID = response.data.id;
                setChannelID(newChannelID);

                if (response.data.ingestionStatus === 'INGESTED') {
                    if (response.data.ingestedAt === undefined || new Date(new Date(response.data.ingestedAt).getTime() + 1 * 60 * 60 * 1000) < new Date()) {
                        await processChannelIngestion(newChannelID);
                        setTimeout(async () => {
                            fetchChannelVideos();
                        }, 5000);
                    } else {
                        await fetchChannelVideosArray(newChannelID);
                    }
                } else if (response.data.ingestionStatus === 'INGESTING') {
                    setTimeout(async () => {
                        fetchChannelVideos();
                    }, 5000);
                } else {
                  setChannelID(newChannelID);

                  await processChannelIngestion(newChannelID);
                  
                  setTimeout(async () => {
                      fetchChannelVideos();
                  }, 5000);
                }
            } catch (error: any) {
                if (error.data.ingestionStatus === 'NULL') {
                    const newChannelID = error.data.id;
                    setChannelID(newChannelID);

                    await processChannelIngestion(newChannelID);
                    
                    setTimeout(async () => {
                        // await fetchChannelVideosArray(newChannelID);
                        
                        // if ingesting has started call fetch channel videos again and if status is ingesting it fetched top 20 videos
                        fetchChannelVideos();
                    }, 5000);
                }
                console.log("Unhandled error response:", error.response);
            } finally {
                setCurrentPage(1);
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setSortCriteria('viewCount');
                setSortOrder('desc');
                setLastSelectedIndex(null);
                setSelectedVideos([]);
            }
        }
    };

    const fetchVideo = async () => {
      if (url) {
            try {
                setIsSubmitting(true);
                const response = await getVideo(extractVideoId(url));
                console.log(response);
                setFilteredVideos([response.data]);
                setChannelID(response.data.channelId);
            } catch (error: any) {
                console.log(error);
                toast.error("Error fetching video");
            } finally {
                setIsSubmitting(false);
                setCurrentPage(1);
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setSortCriteria('viewCount');
                setSortOrder('desc');
                setLastSelectedIndex(null);
                setSelectedVideos([]);
            }
        }
    }

    const fetchVideos = async () => {
      // check if url is channel or video
      if (url) {
        if (url.includes('youtube.com/watch?v=')) {
          // if video
          fetchVideo();
        } else {
          // if channel
          fetchChannelVideos();
        }
      }
    }

    const renderPagination = () => {
        const totalPages = Math.ceil(totalVideo / videosPerPage);
        const items = [];

        if (totalPages <= 1) return null;
        items.push(
            <Pagination.Item key={1} active={1 === currentPage} onClick={() => handlePageClick(1)}>
                1
            </Pagination.Item>
        );

        if (currentPage > 3) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" />);
        }

        for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
            items.push(
                <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageClick(i)}>
                    {i}
                </Pagination.Item>
            );
        }
        if (currentPage < totalPages - 2) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        }

        items.push(
            <Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageClick(totalPages)}>
                {totalPages}
            </Pagination.Item>
        );
        return <Pagination>{items}</Pagination>;
    };

    //whenever number of videos is updated call render function to change pagination number
    useEffect(() => {
        renderPagination();
    },[totalVideo]);

    return (
        <>
            <Form onSubmit={handleSubmit} className="p-4">
                <h1 className="text-center">Analyze Channel</h1>
                <Form.Group controlId="formUrl" className="mt-3">
                    <Form.Label className='form-labels'>Enter YouTube Channel/Video URL</Form.Label>
                    <Row>
                        <Col xs={10}>
                            <Form.Control
                                type="url"
                                placeholder="Enter URL (e.g. https://www.youtube.com/@OpenAI or https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </Col>
                        <Col xs={2}>
                            <Button variant='primary' onClick={fetchVideos}>
                                Fetch Videos
                            </Button>
                        </Col>
                    </Row>
                </Form.Group>

                <div>
                    <Form.Group controlId="formDateFilter" className="mt-3">
                        <Form.Label className='form-labels'>
                            Filter by Date <i>(optional)</i>
                        </Form.Label>
                        <Row className='align-items-end'>
                            <Col xs={12} md={5}>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    placeholder="Start Date (YYYY-DD-MM)"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Col>
                            <Col xs={12} md={5}>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    placeholder="End Date (YYYY-MM-DD)"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Col>
                            <Col xs={12} md={2}>
                                <Button onClick = {() => {setStartDate(''); setEndDate('')}}>
                                    Clear Date
                                </Button>
                            </Col>
                        </Row>
                    </Form.Group>

                    <Row className="mt-3">
                        <Col xs={12} md={5} lg={5}>
                            <Form.Group controlId="formSortCriteria">
                                <Form.Label className='form-labels'>Sort By</Form.Label>
                                <div className='d-flex'>
                                    <Form.Check
                                        type="radio"
                                        label="View Count"
                                        name="sortCriteria"
                                        id="viewCount"
                                        checked={sortCriteria === 'viewCount'}
                                        onChange={() => setSortCriteria('viewCount')}
                                        style={{ marginRight: "10px" }}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Published Date"
                                        name="sortCriteria"
                                        id="publishedAt"
                                        checked={sortCriteria === 'publishedAt'}
                                        onChange={() => setSortCriteria('publishedAt')}
                                        className="ml-5"
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={5} lg={5}>
                            <Form.Group controlId="formSortOrder">
                                <Form.Label className='form-labels'>Sort Order</Form.Label>
                                <div className='d-flex'>
                                    <Form.Check
                                        type="radio"
                                        label="Ascending"
                                        name="sortOrder"
                                        id="ascending"
                                        checked={sortOrder === 'asc'}
                                        onChange={() => setSortOrder('asc')}
                                        style={{ marginRight: "10px" }}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Descending"
                                        name="sortOrder"
                                        id="descending"
                                        checked={sortOrder === 'desc'}
                                        onChange={() => setSortOrder('desc')}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    
                    <Row className='mt-2'>
                        <Form.Label className='form-labels'>Search Videos</Form.Label>
                        <Col md={9} lg={10}>
                            <Form.Control
                                type='text'
                                placeholder='Search by video title'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Col>
                        <Col md={2}>
                                    <Button onClick = {() => {setSearchQuery('')}}>
                                        Clear Search
                                    </Button>
                        </Col>
                    </Row>

                    </Row>

                    <Form.Group controlId='formSearch' className='mt-3'>
                        <Row className='d-flex flex-column mt-3'>
                            <div className='channel-list'>
                                {filteredVideos.map((video, index) => (
                                    <Col md={6} lg={3} key={index} className='mb-3'>
                                        <VideoCard
                                        key={index}
                                        video={video}
                                        handleVideoCardClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleVideoCardClick(video.id, index, event)}
                                        isSelected={selectedVideos.includes(video.id)}
                                    />
                                    </Col>
                                ))}
                            </div>
                        </Row>
                        <Pagination className='mt-3 justify-content-center'>
                            {renderPagination()}
                        </Pagination>
                    </Form.Group>
                </div>

                <Row className="mt-3">
                    <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Prompt Selection</Accordion.Header>
                            <Accordion.Body>
                                <Form.Group controlId="formPrompts" className="mt-3">
                                    <Row className="mt-3">
                                        <Col xs={12}>
                                            <Button variant="secondary" onClick={handleSelectDeselectAll}>
                                                {selectedPrompts.length === prompts.length ? 'Deselect All' : 'Select All'}
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        {prompts.map((prompt) => (
                                            <Col xs={12} lg={6} className="mb-3" key={prompt.id}>
                                                <PromptCheckbox
                                                    prompt={prompt.title}
                                                    prompt_id={prompt.id}
                                                    checked={selectedPrompts.includes(prompt.id)}
                                                    onSelectDeselectPrompt={handleCheckboxChange}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </Form.Group>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Row>

                <Row className='justify-content-left mt-3'>
                    <Col xs={12} md='auto' className='mb-2 mb-md-0'>
                        <Button variant='primary' type='submit' className='w-100' disabled={selectedVideos.length === 0}>
                            Begin Video Analysis
                        </Button>
                    </Col>
                    <Col xs={12} md='auto'>
                        <Link to='/l1-prompts'>
                            <Button variant='secondary' className='w-100'>
                                Edit Prompts
                            </Button>
                        </Link>
                    </Col>
                </Row>
            </Form>
            {isSubmitting && <Loader />}
        </>
    );
}

export default AnalyzeChannel;
