import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { listAllChannels } from '../../api/channels';
import Loader from '../spinner';
import './index.css'
import { ChannelInterface } from '../Interfaces';

interface MarkdownDropdownProps {
  onSelect: (eventKey: string | null) => void;
  selectedChannel : string;
}


/*
  fetches all channels from /channels route and lists channel displayName in dropdown
*/
const ChannelDropdown: React.FC<MarkdownDropdownProps> = ({ onSelect, selectedChannel }) => {
  const [channels, setChannels] = useState<ChannelInterface[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); 
  
  useEffect(() => {

    const fetchData = async () => {
      try {
        setIsSubmitting(true);
          const response = await listAllChannels(false)
          let data = response.data.channels;
          data = data.sort((c1: any, c2: any) => c1.displayName.localeCompare(c2.displayName));
          setChannels(data);
      } catch (error: any) {
        console.error("Error fetching channels from API", error);
      } finally {
        setIsSubmitting(false);
      }
    }
    fetchData()
  }, []);

  return (
    <div>
    <DropdownButton id="dropdown-basic-button" title={selectedChannel ? selectedChannel : "Select Channel"}  variant="primary" onSelect={onSelect} >
      <div className='dropdown-list'>
          {channels.map(channel => (
            // Evenk key is made like this to update channel name in dropdown and pass channel ID for further analysis (if required)
            <Dropdown.Item eventKey={`${channel.id}:${channel.displayName}`} key={channel.id} style={{marginLeft : 0}}>{channel.displayName}</Dropdown.Item>
          ))}
        </div>
      </DropdownButton>

      {isSubmitting && (
                <Loader />
        )}    
    </div>
  );
};

export default ChannelDropdown;
