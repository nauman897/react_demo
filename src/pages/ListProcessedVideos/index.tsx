import React, { useState, useEffect } from 'react'
import { Row, Col, Container, FormControl, InputGroup, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ChannelCard} from '../../components/Cards/ChannelCardHomePage'
import { listAllChannels } from '../../api/channels'
import { ChannelInterface } from '../../components/Interfaces'
import { TrackResponse } from '../../api/posthogAPIMonitoring'
import Loader from '../../components/spinner'
import './index.css'


const ListProcessedVideos: React.FC = () => {
	const [channels, setChannels] = useState<ChannelInterface[] | null>(null)
	const [searchQuery, setSearchQuery] = useState<string>('') 
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false) 

	const navigate = useNavigate()

	const handleChannelSelect = (channelID: string) => {
		navigate(`/channel-details/${channelID}`)
	}

	// Fetch all channels
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsSubmitting(true)
				const response = await listAllChannels(true)

				TrackResponse(response, 'get/prompts', undefined)

				console.log(response)
				const data = response.data
				setChannels(data.channels)
			} catch (error: any) {
				console.error('Error fetching channels from API', error)
			} finally {
				setIsSubmitting(false)
			}
		}
		fetchData()
	}, [])

	
	
	const filteredChannels = channels?.filter(
		(channel) =>
			channel.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
			channel.displayName.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const handleAnalyzeChannel = () => {
		navigate('/process-channel')
	}

	return (
		<Container fluid className='d-flex flex-column outer-container'>
			<div className='btn-container'>
				<Button variant='primary' onClick={handleAnalyzeChannel} className='add-channel-btn'>
					Add Channel
				</Button>
			</div>
			<h1 style={{ marginLeft: '20px' }}>Channels</h1>
			<Row className='align-items-center mb-3'>
				<div className='d-flex align-items-center' style={{ width: '98%' }}>
					<InputGroup>
						<FormControl
							type='text'
							placeholder='Search channels'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='search-bar'
						/>
					</InputGroup>
				</div>
			</Row>
			<Row>
				<Col md={12} className='mb-3'>
					<div className='channel-list'>
						{filteredChannels?.map((channel, index) => (
							<ChannelCard
								key={index}
								channel = {channel}
								handleChannelCardClick={() => handleChannelSelect(channel.id)} 
							/>
						))}
					</div>
				</Col>
			</Row>
			{isSubmitting && <Loader />}
		</Container>
	)
}

export default ListProcessedVideos
