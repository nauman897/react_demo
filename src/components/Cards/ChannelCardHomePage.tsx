import React from 'react';
import { formatDate, formatNumbers } from '../../utils/formatFunctions';
import { ChannelCardProps } from '../Interfaces';
import './ChannelCard.css'; 

/*
  Channel card on /home route
*/

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, handleChannelCardClick }) => {
  return (
    <div className="channel-card" onClick={handleChannelCardClick}>
      <img src={channel.avatarUrl} alt={`${channel.handle} profile`} className="profile-img" />
      <div className="channel-card-content">
        <h2 className="channel-title-name">{channel.displayName}</h2>
        <span>Subscriber count : {formatNumbers(channel.subscriberCount)}</span>
        <span>Last processed : {formatDate(channel.processedAt)}</span>
        <div className="channel-desc"><p>{channel.description}</p></div>
      </div>
    </div>
  );
};
