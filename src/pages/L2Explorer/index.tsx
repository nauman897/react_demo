import React, { useCallback, useState, useEffect, useRef, ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import useWebSocket from 'react-use-websocket'
import { Container, Row, Col } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faRobot, faUser } from '@fortawesome/free-solid-svg-icons'
import MarkdownPreview from '@uiw/react-markdown-preview'
import ChannelDropdown from '../../components/Dropdown/channelDropdown'
import { WEBSOCKET_URL } from '../../constants'
import { toast } from 'react-toastify'
import './index.css'
import PreviewComponent from '../../components/PreviewComponent'

interface Artifact {
    identifier: string
    title: string
    type: string
    content: string
}

interface Message {
    role: 'user' | 'assistant'
    content: string
    rawContent?: string
    objects: Artifact[]
}

function L2Explorer() {
	const [selectedChannel, setSelectedChannel] = useState<string>('')
	const [selectedChannelID, setSelectedChannelID] = useState<string>('')
	const [input, setInput] = useState<string>('')
	const [messages, setMessages] = useState<Message[]>([])
	const [currentMessage, setCurrentMessage] = useState<string>('')
	const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
	const [receivingMessage, setReceivingMessage] = useState<boolean>(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(WEBSOCKET_URL, {
		onOpen: () => console.log('WebSocket connection established.'),
		onClose: () => console.log('WebSocket connection closed.'),
		onError: (error) => console.error('WebSocket error:', error),
		shouldReconnect: () => false, // Disable automatic reconnection
	})

	const addObject = (text: string, type: string, message: Message) => {
		if (text.length > 0) {
			if (message.objects[message.objects.length - 1].type == type) {
				message.objects[message.objects.length - 1].content += text
			} else {
				message.objects.push({
					identifier: '',
					title: '',
					type: type,
					content: text
				})
			}
		}
	}

    const processNewChunk = useCallback((prevMessages: Message[], chunk: string, source: string) => {
        const lastMsg = prevMessages[prevMessages.length - 1]
        // Note: strict mode calls this function twice from inside setMessages in dev mode.
        // Uncomment the following lines when running locally in dev mode.
        // if (lastMsg.content.endsWith(chunk)) {
        //     return prevMessages
        // }
        if (lastMsg.role === 'assistant') {
            lastMsg.content = lastMsg.content + chunk
            lastMsg.rawContent = (lastMsg.rawContent ?? '') + chunk
            if ("<antthinking>".startsWith(lastMsg.rawContent) || lastMsg.rawContent.startsWith("<antthinking>") || lastMsg.rawContent.includes("<antthinking>")) {
                // new object is artifact
                if (lastMsg.rawContent.includes("</antartifact>")) {
                    const match = lastMsg.rawContent.match(/(.*?)<antthinking>.*<\/antthinking>.*<antartifact.*?identifier="(.*?)".*?type="(.*?)".*?title="(.*?)".*?>(.+?)<\/antartifact>(.*)/s)
                    if (match) {
                        const [, before, identifier, type, title, content, after] = match
						addObject(before, source, lastMsg)
                        lastMsg.objects.push({
                            identifier,
                            type,
                            title,
                            content
                        })
						addObject(after, source, lastMsg)
                    }
					lastMsg.rawContent = ''
                }
            } else {
                // new object is string content
				addObject(chunk, source, lastMsg)
                lastMsg.rawContent = ''
            }
            return [...prevMessages]
        } else {
            return [...prevMessages, { role: 'assistant' as const, content: chunk, objects: [{
				identifier: '',
				type: source,
				title: '',
				content: chunk
			}] }]
        }
    }, [])

	useEffect(() => {
		try {
			if (lastMessage !== null) {
				setReceivingMessage(true)
				const parsedMessage = JSON.parse(lastMessage.data)
				if (parsedMessage.type === 'L2Response' && parsedMessage.message) {
					setMessages((prevMessages) => processNewChunk(prevMessages, parsedMessage.message, parsedMessage.source))
				} else if (parsedMessage.message === null) {
                    console.log("messages", messages)
                    setReceivingMessage(false)
                    setIsAnalyzing(false)
                }
			}
		} catch {
			console.log('Error')
		}
	}, [lastMessage])

	const handleSelect = (eventKey: string | null) => {
		if (eventKey) {
			const [channelId, channelName] = eventKey.split(':')
			setSelectedChannel(channelName)
			setSelectedChannelID(channelId)
			// Clear chat messages and current message
			setMessages([])
			setCurrentMessage('')
		}
	}

	const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setInput(event.target.value)
	}

	const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!selectedChannel) {
			toast.error('Please select a channel.')
			return
		}
		if (input.trim() !== '') {
			const userMessage = { role: 'user' as const, content: input, objects: [] }
			const payload = {
				explorer: 'L2',
				message: input,
				channel_id: selectedChannelID,
			}

			console.log("payload", payload)

			setTimeout(() => {
				sendMessage(JSON.stringify(payload))
				setMessages((prevMessages) => [...prevMessages, userMessage])
				setInput('')
				setIsAnalyzing(true)
			}, 100)
		}
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleFormSubmit(event as unknown as FormEvent<HTMLFormElement>)
		}
	}

	const scrollToBottom = () => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
		}
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages, currentMessage])

    const renderMessage = useCallback((message: Message, index: number) =>
        <div key={index} className={`message ${message.role}`}>
            {message.role === 'assistant' && <FontAwesomeIcon icon={faRobot} className='icon' />}
            <div>
            {
                message.objects && message.objects.length
                    ? message.objects.map((messageObject, idx) => {
						const isReact = (obj: Artifact) => obj.type == "application/vnd.ant.react" || obj.type == "text/html"
						const margin = idx > 0 && isReact(message.objects[idx - 1]) ? 80 : 0
						console.log(idx ? message.objects[idx - 1].type : "empty", margin)
						return (
							typeof messageObject === "string"
								? <MarkdownPreview className='message-content' source={messageObject} style={{color: 'black', marginTop: margin}} />
								: isReact(messageObject)
								? <PreviewComponent code={messageObject.content} />
								: messageObject.type == "image/jpeg" || messageObject.type == "image/png"
								? <img src={messageObject.content} style={{maxWidth:1000}}/>
								: <MarkdownPreview className='message-content' source={messageObject.content} style={{color: 'black', marginTop: margin}} />
						)
					})
                    : <MarkdownPreview className='message-content' source={message.content} style={{color: 'black'}} />
            }
            </div>
            {message.role === 'user' && <FontAwesomeIcon icon={faUser} className='icon' />}
        </div>
    , [])

	return (
		<Container fluid className='d-flex flex-column outer-container'>
			<h1>L2 Explorer</h1>
			<Row className='align-items-center mb-3'>
				<Col className='d-flex'>
					<ChannelDropdown onSelect={handleSelect} selectedChannel={selectedChannel} />
				</Col>
			</Row>
			<div className='chat-container'>
				<div className='chat-messages'>
					{messages.map(renderMessage)}
					{isAnalyzing && (
						<div className='message assistant'>
							<FontAwesomeIcon icon={faSpinner} spin className='icon' />
							<p className='message-content'>Analyzing...</p>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
				<form onSubmit={handleFormSubmit} className='chat-input'>
					<textarea
						className='nmessage-input'
						value={input}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder='Enter query'
						disabled={isAnalyzing || receivingMessage}
					/>
					<button type='submit' className='submit-btn' disabled={isAnalyzing || receivingMessage}>
						Send
					</button>
				</form>
			</div>
		</Container>
	)
}

export default L2Explorer
