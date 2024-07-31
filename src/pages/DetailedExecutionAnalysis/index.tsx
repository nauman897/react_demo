import React, { useState, useEffect } from 'react'
import { Spinner } from 'react-bootstrap'
import { getDetailedAnalysis } from '../../api/analysis'
import { useParams } from 'react-router-dom'
import { ExecutionDetails, ExecutionDetailsElements, ExecutionVideoDetails } from '../../components/Interfaces/index'
import { VideoCard } from '../../components/Cards/VideoCardDetailedExecution'
import { TrackResponse } from '../../api/posthogAPIMonitoring'

const DetailedExecutionAnalysis: React.FC = () => {
	const analysisId = useParams<{ analysisId: string }>().analysisId
	const [execution, setExecution] = useState<ExecutionDetails>()
	const [isLoading, setIsLoading] = useState(true)
	
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await getDetailedAnalysis(analysisId!)
				TrackResponse(response, `get/analysis/${analysisId}`, undefined)
				const data: ExecutionDetails = response.data?.execution_details
				console.debug('Data fetched from API', data)
				setExecution(data)
				setIsLoading(false)
			} catch (error: any) {
				console.error('Error fetching data from API', error)
			}
		}
		fetchData()
	}, [analysisId])

	return (
		<>
			<h1 className='text-center'>Detailed Analysis</h1>
			{isLoading ? (
				<div className='spinner-container'>
					<Spinner animation='border' role='status'>
						<span className='visually-hidden'>Loading...</span>
					</Spinner>
				</div>
			) : (
				execution &&
				execution?.videos.map((video : ExecutionDetailsElements) => {
					console.log(video)
					return <VideoCard key={video.video_id} {...video} />
				})
			)}
		</>
	)
}

export default DetailedExecutionAnalysis
