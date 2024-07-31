import React, { useState, useEffect, useRef, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import useWebSocket from 'react-use-websocket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import MarkdownPreview from '@uiw/react-markdown-preview';
import ChannelDropdown from '../../components/Dropdown/channelDropdown';
import VideoDropdown from '../../components/Dropdown/videoDropdown';
import { WEBSOCKET_URL } from '../../constants';
import { toast } from 'react-toastify';

const L1Explorer: React.FC = () => {
    const [selectedChannel, setSelectedChannel] = useState<string>('');
    const [selectedChannelId, setSelectedChannelId] = useState<string>('');
    const [selectedVideo, setSelectedVideo] = useState<string>('');
    const [input, setInput] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [currentMessage, setCurrentMessage] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [receivingMessage, setReceivingMessage] = useState<boolean>(false);

    const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(WEBSOCKET_URL, {
        onOpen: () => console.log('WebSocket connection established.'),
        onClose: () => console.log('WebSocket connection closed.'),
        onError: (error) => console.error('WebSocket error:', error),
        shouldReconnect: () => false, 
    });
    
    useEffect(() => {
        console.log("readyState value ",readyState);
    }, [readyState])
    
    useEffect(() => {
        console.log("isAnalyzing changed ",isAnalyzing);
    }, [isAnalyzing])
    
    useEffect(() => {
        console.log("messages ",messages);
    }, [messages])
    
    useEffect(() => {
        try{
            if (lastMessage !== null) {
                setReceivingMessage(true);
                const parsedMessage = JSON.parse(lastMessage.data);
                if (parsedMessage.type === 'L1Response' && parsedMessage.message) {
                    setCurrentMessage((prevMessage) => prevMessage + parsedMessage.message);
                    setIsAnalyzing(false);
                }
                if (parsedMessage.type === 'L1ResponseEnd') {
                    setReceivingMessage(false);
                    setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: currentMessage }]);
                    console.log(currentMessage);
                    setCurrentMessage('');
                }
            }
        } catch {
            console.log("Error");
        }
    }, [lastMessage]);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedChannel || !selectedVideo) {
            toast.error("Select channel and video.");
            return;
        }

        
        if (input.trim() !== '') {
            
            const userMessage = { role: 'user', content: input };
            const payload = {
                explorer: 'L1',
                messages: [...messages, userMessage],
                channel_id: selectedChannelId,
                video_id: selectedVideo
            };

            
            console.log(payload);

            // Reconnect and send the new message
            setTimeout(() => {
                sendMessage(JSON.stringify(payload));
                setMessages((prevMessages) => [...prevMessages, userMessage]);
                setInput('');
                setIsAnalyzing(true);
            }, 100); // Delay to ensure the socket is closed before reconnecting
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleFormSubmit(event as unknown as FormEvent<HTMLFormElement>);
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentMessage]);

    const handleChannelSelect = (eventKey: string | null) => {
        if (eventKey) {
            const [channelId, channelName] = eventKey.split(':');
            setSelectedChannel(channelName);
            setSelectedChannelId(channelId);
            setSelectedVideo('');
            setMessages([]);
            setCurrentMessage('');
        }
    };

    const handleVideoSelect = (eventKey: string | null) => {
        if (eventKey) {
            setSelectedVideo(eventKey);
            setMessages([]);
            setCurrentMessage('');
        }
    };

    return (
        <Container fluid className="d-flex flex-column outer-container">
            <h1>L1 Explorer</h1>
            <Row className='align-items-center mb-3'>
                <Col>
                    <ChannelDropdown onSelect={handleChannelSelect} selectedChannel={selectedChannel} />
                </Col>
                <Col className="d-flex">
                    <VideoDropdown onVideoSelect={handleVideoSelect} selectedChannel={selectedChannelId} reset={selectedVideo === ''} />
                </Col>
            </Row>
            <div className="chat-container">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.role}`}>
                            {message.role === 'assistant' ? (
                                <>
                                    <FontAwesomeIcon icon={faRobot} className="icon" />
                                    <MarkdownPreview className="message-content" source={message.content} />
                                </>
                            ) : (
                                <>
                                    <MarkdownPreview className="message-content" source={message.content} />
                                    <FontAwesomeIcon icon={faUser} className="icon" />
                                </>
                            )}
                        </div>
                    ))}
                    {isAnalyzing && (
                        <div className="message assistant">
                            <FontAwesomeIcon icon={faSpinner} spin className="icon" />
                            <p className="message-content">Analyzing...</p>
                        </div>
                    )}
                    {currentMessage.length >0 && (
                        <div className="message assistant">
                            <FontAwesomeIcon icon={faRobot} className="icon" />
                            <MarkdownPreview className="message-content" source={currentMessage} />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleFormSubmit} className="chat-input" >

                    <textarea
                        className='nmessage-input'
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter query"
                        style={{ borderRadius: '10px' }}
                        disabled={isAnalyzing || receivingMessage}
                    />
                    <button type="submit" className="submit-btn" disabled={isAnalyzing || receivingMessage}>Send</button>
                </form>
            </div>
        </Container>
    )
}

export default L1Explorer;