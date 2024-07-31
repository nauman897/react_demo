import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { listChannelVideos } from '../../api/videos';
import { formatDuration } from '../../utils/formatFunctions';
import { VideoDropdownProps } from '../Interfaces';

/*
    Fetches all videos for a channel, using channel id, using listChannelVideos() and lists channel title in dropdown
*/
const VideoDropdown: React.FC<VideoDropdownProps> = ({ onVideoSelect, selectedChannel, reset }) => {
    const [channelVideos, setChannelVideos] = useState<{ id: string; title: string; duration: string }[]>([]);
    const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('Select Video');
    
    useEffect(() => {
        const fetchData = async () => {
            if (selectedChannel) {
                try {
                    const response = await listChannelVideos(selectedChannel);
                    const data = response.data;

                    console.log('API Response:', data);

                    if (data.videos && Array.isArray(data.videos)) {
                        const formattedVideos = data.videos.map((video: { id: string; title: string; duration: number }) => {
                            const duration = formatDuration(video.duration)
                            return {
                                id: video.id,
                                title: video.title,
                                duration: duration,
                            };
                        });

                        setChannelVideos(formattedVideos);
                    } else {
                        toast.error('Invalid data format:', data);
                    }
                } catch (error: any) {
                    toast.error('Error fetching channels from API', error);
                }
            }
        };
        fetchData();
    }, [selectedChannel]);

    useEffect(() => {
        if (reset) {
            setSelectedVideoTitle('Select Video');
        }
    }, [reset]);

    const handleSelect = (eventKey: string | null) => {
        if (eventKey) {
            const selectedVideo = channelVideos.find((video) => video.id === eventKey);
            if (selectedVideo) {
                setSelectedVideoTitle(selectedVideo.title);
            }
        }
        onVideoSelect(eventKey);
    };

    return (
        <DropdownButton
            id="dropdown-basic-button"
            title={selectedVideoTitle}
            variant="primary"
            onSelect={handleSelect}
            className="custom-dropdown"
        >
            {channelVideos.map((video) => (
                <Dropdown.Item eventKey={video.id} key={video.id} className="dropdown-item-custom" style={{marginLeft:0}}>
                    <div>{video.title}</div>
                    <small className="text-muted">Duration - {video.duration}</small>
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
};

export default VideoDropdown;
