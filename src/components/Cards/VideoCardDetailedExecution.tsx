import React, { useState } from 'react'
import { Button, Card, Col, Row, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatDate } from '../../utils/formatFunctions'
import JsonView from '@uiw/react-json-view'
import {
	faEye,
	faThumbsUp,
	faClock,
	faCalendarAlt,
	faCalendarCheck,
	faCircleCheck,
	faCircleXmark,
	faCircleInfo,
} from '@fortawesome/free-solid-svg-icons'
import './VideoCardDetailedExecution.css'
import { ExecutionDetailsElements, ExecutionVideoDetails } from '../Interfaces'
import { formatNumberWithCommas } from '../../utils/formatFunctions'
import CurrentAnalysisModal from '../Modal/currentAnalysisModal'

/*
	VideoCard on /analysis/{executionArn}
	Used separate format function for formatting duration as to it had different format
	view and download json button are disabled for failed analysis, instead a i button is there to show failure reason
*/

const formatDuration = (duration: string) => {
	// Convert YTduration to hours, minutes, and seconds
	const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
	const regex_result = regex.exec(duration)

	if (regex_result == null) return '0:00'

	const hours = parseInt(regex_result[1] || '0')
	const minutes = parseInt(regex_result[2] || '0')
	const seconds = parseInt(regex_result[3] || '0')
	const formattedHours = hours > 0 ? `${hours}:` : ''
	const formattedMinutes = minutes.toString().padStart(2, '0')
	const formattedSeconds = seconds.toString().padStart(2, '0')

	return `${formattedHours}${formattedMinutes}:${formattedSeconds}`
}

const formatTitle = (title: string) => {
	const formattedTitle = title?.replace(/\s/g, '-')
	return formattedTitle?.substring(0, 50)
}

const CustomPopover = ({
	text,
	children,
	disable = false,
}: {
	text: string | null | undefined
	children: any
	disable?: boolean
}) =>
	disable ? (
		children
	) : (
		<OverlayTrigger
			placement='top'
			delay={{ show: 0, hide: 100 }}
			overlay={(props) => (
				<Tooltip id='button-tooltip' {...props}>
					{text}
				</Tooltip>
			)}>
			{children}
		</OverlayTrigger>
	)

export const VideoCard: React.FC<ExecutionDetailsElements> = ({ ...video }) => {
	const processingStatus = video['error-info'] === undefined
	const formattedDuration = formatDuration(video?.details?.duration)
	const [showModal, setShowModal] = useState(false)
	const handleClose = () => setShowModal(false)
	const handleShow = () => setShowModal(true)
	console.log(video);
	return (
		<Card className='video-card mb-3'>
			<Row className='video-row'>
				<Col md={3} className='image-container flex-column justify-content-between'>
					<img
						src={video.details?.thumbnails?.maxres?.url || video.details?.thumbnails?.high?.url}
						alt={video.details?.title}
						className='thumbnail'
					/>
					<Row className='align-items-stretch'>
						<Col className='image-container flex-column'>
							<Button type='button' disabled={!processingStatus} onClick={handleShow}>
								{`View Json`}
							</Button>
							
							<Button
								type='button'
								as='a'
								variant='secondary'
								disabled={!processingStatus}
								href={`data:text/json;charset=utf-8,${encodeURIComponent(
									JSON.stringify(video.analysis)
								)}`}
								download={`${formatTitle(video.details?.title)}.json`}>
								{`Download Json`}
							</Button>

						</Col>
						<CurrentAnalysisModal 
							showAnalysisModal = {showModal} 
							handleAnalysisModalClose = {handleClose}
							video_title = {video.details?.title}
							currentAnalysis = {video.analysis}
						/>
						
					</Row>
				</Col>
				<Col md={8}>
					<Card.Body>
						<Card.Title>{video.details?.title}</Card.Title>
						<Card.Text className='video-about'>{video.details?.description}</Card.Text>
						<div className='video-stats'>
							<span>
								<FontAwesomeIcon className='icon' icon={faEye} /> {formatNumberWithCommas(video.details?.viewCount)} views
							</span>
							<span>
								<FontAwesomeIcon className='icon' icon={faThumbsUp} /> {formatNumberWithCommas(video.details?.likeCount)} likes
							</span>
							<span>
								<FontAwesomeIcon className='icon' icon={faClock} /> {formattedDuration}
							</span>
						</div>
						<div className='video-dates'>
							<span>
								<FontAwesomeIcon className='icon' icon={faCalendarAlt} /> Released:{' '}
								{formatDate(video.details?.publishedAt)}
							</span>
							<span>
								<FontAwesomeIcon className='icon' icon={faCalendarCheck} />
								Last Processed: {formatDate(video.details?.processedAt)}
							</span>
							<CustomPopover
								text={
									!processingStatus && video['error-info']
										? `${video['error-info']['Error']}: ${video['error-info']['Cause']}`
										: ''
								}
								disable={processingStatus}>
								<span style={{ color: processingStatus ? 'green' : 'red' }}>
									<FontAwesomeIcon
										className='icon'
										icon={processingStatus ? faCircleCheck : faCircleInfo}
									/>
									Processing {processingStatus ? 'Successful' : 'Failed'}
								</span>
							</CustomPopover>
						</div>
					</Card.Body>
				</Col>
			</Row>
		</Card>
	)
}
