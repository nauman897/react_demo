import React from 'react';
import { formatDate, formatDuration, formatNumbers } from '../../utils/formatFunctions';
import { VideoCardProps } from '../Interfaces';
import './VideoCardThumbnails.css';

export const VideoCard: React.FC<VideoCardProps> = ({ video, handleVideoCardClick, isSelected }) => {
  const extractMaxResUrl = (thumbnailsString: string | undefined) => {
    if(thumbnailsString){
      try {
        if (thumbnailsString.startsWith('https://storage.googleapis.com/vs-img/')) {
          return thumbnailsString;
        }
        const thumbnails = JSON.parse(thumbnailsString.replace(/'/g, '"'));
        return thumbnails.maxres.url;
      } catch (error) {
        console.error('Error parsing thumbnails:', error);
        return null;
      }
    }
  };

  return (
    <div
      className={`videocard ${isSelected ? 'selected' : ''}`}
      onClick={handleVideoCardClick}
    >
      <div className="thumbnail-img-container">
        <img src={video?.thumbnails?.maxres?.url || video.thumbnails?.high.url || video.thumbnail} alt={video.title} className="thumbnail-img" />
        <div className="duration">{formatDuration(video.duration)}</div>
      </div>
      <div className="videocard-info">
        <h3 className="videocard-title">{video.title}</h3>
        <div className="videocard-stats">
          <span>{formatNumbers(video.viewCount)} views</span>
          <span> • </span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
};
