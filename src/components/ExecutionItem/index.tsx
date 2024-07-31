import React from 'react'
import { ExecutionObject } from '../Interfaces'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { formatTimestamp } from '../../utils/formatFunctions'


/*
	Execution items is each individual row in analysis-execution row
	successful execution has a button to go toh detailed analysis info
	failed shows the failure message in i button
*/

// extracts only the channel handle from the url
function formatChannelID(channelUrl: string) {
	if (channelUrl.includes('youtube.com/@')) {
		return channelUrl.split('@')[1]
	} else return channelUrl
}

function getRowBgColor(state: string) {
	switch (state) {
		case 'SUCCEEDED':
			return '#d4edda'
		case 'FAILED':
			return '#f8d7da'
		case 'RUNNING':
			return '#c7dffc'
		case 'ABORTED':
			return '#f5f5f5'
		default:
			return 'white'
	}
}

const ExecutionItem: React.FC<ExecutionObject> = ({ ...execution }) => {
	const formattedStartTime = formatTimestamp(execution.startDate)
	const formattedStopTime = formatTimestamp(execution.stopDate!)
	const formattedChannelID = execution.input.channel_id;
	const rowBgColor = getRowBgColor(execution.status)
	const detailedAnalysisAvailable = execution.status === 'SUCCEEDED' || execution.status === 'FAILED'
	const detailedAnalysisFailed = execution.status === 'FAILED'
	const navigate = useNavigate()

	function showDetailedAnalysis() {
		navigate(`/analysis/${execution.id}`)
	}

	return (
		<tr>
			<td style={{ backgroundColor: rowBgColor }}>{execution.input.channel_handle}</td>
			<td style={{ backgroundColor: rowBgColor }}>{execution.input.video_ids.length}</td>
			{/* <td style={{ backgroundColor: rowBgColor }}>{execution.sortVideos}</td> */}
			<td style={{ backgroundColor: rowBgColor }}>{formattedStartTime}</td>
			<td style={{ backgroundColor: rowBgColor }}>{formattedStartTime ? formattedStopTime : 'N/A'}</td>
			<td style={{ backgroundColor: rowBgColor }}>{execution.status}</td>
			<td style={{ backgroundColor: rowBgColor }}>
				{detailedAnalysisFailed && (
						<OverlayTrigger
							placement='bottom-end'
							delay={{ show: 0, hide: 100 }}
							overlay={(props) => (
								<Tooltip id='button-tooltip' {...props}>
									{execution.error ?? ""}
								</Tooltip>
							)}>
							<i className='fa-solid fa-circle-info fa-md' style={{ color: 'red', marginRight: '10px' }} />
						</OverlayTrigger>
					)
				}
				{detailedAnalysisAvailable && (
					<Button onClick={showDetailedAnalysis}>View</Button>
				)}
			</td>
		</tr>
	)
}

export default ExecutionItem
