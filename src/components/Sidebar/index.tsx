import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars } from 'react-icons/fa'
import { Nav, Navbar, Button } from 'react-bootstrap'
import { VERSION } from '../../constants'
import './index.css'
import LogoutButton from '../Auth Buttons/logoutButton'



const Sidebar: React.FC = () => {
	const [expanded, setExpanded] = useState<boolean>(true)
	const [explorerOpen, setExplorerOpen] = useState<boolean>(false)
	const [adminOpen, setAdminOpen] = useState<boolean>(false)

	const toggleSidebar = () => {
		setExpanded(!expanded)
	}

	const toggleExplorer = () => {
		setExplorerOpen(!explorerOpen)
	}

	const toggleAdmin = () => {
		setAdminOpen(!adminOpen)
	}

	return (
		<div className={`sidebar-container ${expanded ? 'expanded' : 'collapsed'}`}>
			<Button variant='link' className='toggle-btn' onClick={toggleSidebar}>
				<FaBars />
			</Button>
			<div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
				<Navbar expand='lg' className='flex-column'>
					<Nav className='flex-column'>
						<Nav.Item>
							<Nav.Link as={Link} to='/home'>
								Channels
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link as={Link} to='/analysis-executions'>
								Channel Analysis History
							</Nav.Link>
						</Nav.Item>
						
						<Nav.Item>
							<Nav.Link as={Link} to='/reports'>
								Reports
							</Nav.Link>
						</Nav.Item>

						<Nav.Item>
							<Nav.Link as={Link} to='#' onClick={toggleExplorer} className='dropdown-toggle'>
								Explore
							</Nav.Link>
							{explorerOpen && (
								<div className={`submenu ${explorerOpen ? 'open' : ''}`}>
									<Nav.Link as={Link} to='/l1-explorer' className='dropdown-item'>
										{' '}
										L1 Explorer
									</Nav.Link>{' '}
									{/* Not yet created */}
									<Nav.Link as={Link} to='/l2-explorer' className='dropdown-item'>
										{' '}
										L2 Explorer
									</Nav.Link>
								</div>
							)}
						</Nav.Item>

						<Nav.Item>
							<Nav.Link as={Link} to='#' onClick={toggleAdmin} className='dropdown-toggle'>
								Admin
							</Nav.Link>
							{adminOpen && (
								<div className={`submenu ${adminOpen ? 'open' : ''}`}>
									<Nav.Link as={Link} to='/upload-file' className='dropdown-item'>
										Second Brains
									</Nav.Link>
									<Nav.Link as={Link} to='/l1-prompts' className='dropdown-item'>
										Video Analysis Prompts (L1)
									</Nav.Link>
									<Nav.Link as={Link} to='/view-template' className='dropdown-item'>
										Report Templates (L2)
									</Nav.Link>
								</div>
							)}
						</Nav.Item>


						<div className='version text-center'>
							<LogoutButton />
							<br /> <small>V {VERSION}</small>
						</div>
					</Nav>
				</Navbar>
			</div>
		</div>
	)
}

export default Sidebar
