import React, { useState, useEffect } from 'react'
import { Table, Pagination, Spinner, Tabs, Tab } from 'react-bootstrap'
import { IoMdRefresh } from 'react-icons/io'
import ExecutionItem from '../../components/ExecutionItem'
import { listAllExecutions } from '../../api/analysis'
import { ExecutionObject } from '../../components/Interfaces'
import './index.css'
import Loader from '../../components/spinner'

const AnalysisExecutions: React.FC = () => {
	const [executions, setExecutions] = useState<ExecutionObject[]>([])
	const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [isLoading, setIsLoading] = useState(true)
	const [nextPageLoader, setNextPageLoader] = useState(false)
	const [selectedStatus, setSelectedStatus] = useState<string>('All')
	const [nextPageToken, setNextPageToken] = useState<string | null>(null)
	const itemsPerPage = 10

	const fetchData = async (refresh = false) => {
		try {
			const response = refresh ? await listAllExecutions() : await listAllExecutions(nextPageToken)
			const data: ExecutionObject[] = response.data.executions
			setNextPageToken(response.data.nextPageToken)
			setExecutions(refresh ? data : executions.concat(data))
			setUniqueStatuses(Array.from(new Set(data.map((execution) => execution.status))))
		} catch (error: any) {
			console.error('Error fetching data from API', error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (isLoading) {
			currentPage != 1 && setCurrentPage(1)
			fetchData(true)
		}
	}, [isLoading])

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber)
	}

	const handleTabSelect = (status: string) => {
		setSelectedStatus(status);
		setCurrentPage(1); 
	}

	const filteredExecutions =
		selectedStatus === 'All' ? executions : executions.filter((execution) => execution.status === selectedStatus)

	console.log(filteredExecutions)
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentItems = filteredExecutions.slice(indexOfFirstItem, indexOfLastItem)
	const totalPages = Math.ceil(filteredExecutions.length / itemsPerPage)

	return (
		<>
			<h1 className='text-center'>Channel Analysis History</h1>
			{isLoading ? (
				<div className='spinner-container'>
					<Spinner animation='border' role='status'>
						<span className='visually-hidden'>Loading...</span>
					</Spinner>
				</div>
			) : (
				<>
					{nextPageLoader && <Loader />}
					<div className='tab-div'>
						<Tabs
							id='status-tabs'
							activeKey={selectedStatus}
							onSelect={(k) => handleTabSelect(k || 'All')}
							className='custom-tabs'>
							<Tab eventKey='All' title='All' />
							<Tab eventKey='RUNNING' title='RUNNING' />
							<Tab eventKey='SUCCEEDED' title='SUCCEEDED' />
							{uniqueStatuses.includes('FAILED') && <Tab eventKey='FAILED' title='FAILED' />}
							{uniqueStatuses.includes('TIMED_OUT') && <Tab eventKey='TIMED_OUT' title='TIMED_OUT' />}
							{uniqueStatuses.includes('ABORTED') && <Tab eventKey='ABORTED' title='ABORTED' />}
							{uniqueStatuses.includes('PENDING_REDRIVE') && (
								<Tab eventKey='PENDING_REDRIVE' title='PENDING_REDRIVE' />
							)}
						</Tabs>
						<IoMdRefresh className='refresh-button' onClick={() => setIsLoading(true)} />
					</div>
					<Table className='custom-table'>
						<thead>
							<tr>
								<th className='text-center table-column-channel-id'>Channel ID</th>
								<th className='text-center table-column-number-of-videos'>Number of Videos</th>
								{/* <th className='text-center table-column-sort-videos'>Sort Videos</th> */}
								<th className='text-center table-column-start-date'>Start Date</th>
								<th className='text-center table-column-stop-date'>Stop Date</th>
								<th className='text-center table-column-status'>Status</th>
								<th className='text-center table-column-status'>Detailed Analysis</th>
							</tr>
						</thead>
						<tbody>
							{currentItems.map((execution, index) => (
								<ExecutionItem key={index} {...execution} />
							))}
						</tbody>
					</Table>
					<Pagination className='justify-content-center'>
						<Pagination.Prev disabled={currentPage === 1} />
						{Array.from({ length: totalPages }, (_, index) => (
							<Pagination.Item
								key={index + 1}
								active={index + 1 === currentPage}
								onClick={() => handlePageChange(index + 1)}>
								{index + 1}
							</Pagination.Item>
						))}
						<Pagination.Next
							disabled={nextPageToken == null}
							onClick={async () => {
								setNextPageLoader(true)
								await fetchData()
								setNextPageLoader(false)
								setCurrentPage(totalPages + 1)
							}}
						/>
					</Pagination>
				</>
			)}
		</>
	)
}

export default AnalysisExecutions
