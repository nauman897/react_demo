import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AnalysisExecutions from './pages/AnalysisExecutions'
import L1Prompts from './pages/VideoAnalysisPrompts'
import L1Explorer from './pages/L1Explorer'
import L2Explorer from './pages/L2Explorer'
import FileUploader from './pages/UploadFile'
import Sidebar from './components/Sidebar'
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from './constants'
import PrivateRoute from './pages/Login Page/PrivateRoute'
import Login from './pages/Login Page/index'
import ListProcessedVideos from './pages/ListProcessedVideos'
import TemplateList from './pages/Report Builder/main'
import UpdateTemplate from './pages/Report Builder/updateTemplate'
import AddTemplate from './pages/Report Builder/addTemplate'
import DuplicateTemplate from './pages/Report Builder/duplicateTemplate'
import DetailedExecutionAnalysis from './pages/DetailedExecutionAnalysis'
import PostHogPageviewTracker from './components/PageViewTrack/PageViewTracker'
import Channel from './pages/Detailed Info/channel'
import Video from './pages/Detailed Info/video'
import AnalyzeChannel from './pages/AnalyzeChannel'
import ViewReports from './components/Reports'

import './App.css'

const MainLayout: React.FC = () => {
	const location = useLocation()
	const hideSidebarRoutes = ['/']

	const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname)

	return (
		<div className='App ml-2 d-flex'>
			<PostHogPageviewTracker />
			{!shouldHideSidebar && <Sidebar />}
			{/* <Sidebar /> */}
			<div className='content flex-grow-1'>
				<Routes>
					<Route path='/' element={<Login />} />
					<Route
						path='/home'
						element={
							<PrivateRoute>
								<ListProcessedVideos />
							</PrivateRoute>
						}
					/>
					<Route
						path='/process-channel'
						element={
							<PrivateRoute>
								<AnalyzeChannel />
							</PrivateRoute>
						}
					/>
					<Route
						path='/reports'
						element={
							<PrivateRoute>
								<ViewReports />
							</PrivateRoute>
						}
					/>
					<Route
						path='/analysis-executions'
						element={
							<PrivateRoute>
								<AnalysisExecutions />
							</PrivateRoute>
						}
					/>
					<Route
						path='/analysis/:analysisId'
						element={
							<PrivateRoute>
								<DetailedExecutionAnalysis />
							</PrivateRoute>
						}
					/>
					<Route
						path='/l1-prompts'
						element={
							<PrivateRoute>
								<L1Prompts />
							</PrivateRoute>
						}
					/>
					<Route
						path='/l1-explorer'
						element={
							<PrivateRoute>
								<L1Explorer />
							</PrivateRoute>
						}
					/>
					<Route
						path='/l2-explorer'
						element={
							<PrivateRoute>
								<L2Explorer />
							</PrivateRoute>
						}
					/>
					<Route
						path='/upload-file'
						element={
							<PrivateRoute>
								<FileUploader />
							</PrivateRoute>
						}
					/>

					<Route
						path='/view-template'
						element={
							<PrivateRoute>
								<TemplateList />
							</PrivateRoute>
						}
					/>

					<Route
						path='/update-template'
						element={
							<PrivateRoute>
								<UpdateTemplate />
							</PrivateRoute>
						}
					/>

					<Route
						path='/add-template'
						element={
							<PrivateRoute>
								<AddTemplate />
							</PrivateRoute>
						}
					/>

					<Route
						path='/duplicate-template'
						element={
							<PrivateRoute>
								<DuplicateTemplate />
							</PrivateRoute>
						}
					/>

					<Route
						path='/channel-details/:channel_id'
						element={
							<PrivateRoute>
								<Channel />
							</PrivateRoute>
						}
					/>

					<Route
						path='/channel-details/:channel_id/:video_id'
						element={
							<PrivateRoute>
								<Video />
							</PrivateRoute>
						}
					/>
				</Routes>
			</div>
		</div>
	)
}

function App() {
	return (
		<Auth0Provider
			domain={AUTH0_DOMAIN}
			clientId={AUTH0_CLIENT_ID}
			authorizationParams={{
				redirect_uri: window.location.origin,
				audience: `https://${AUTH0_DOMAIN}/api/v2/`,
				scope: 'openid profile email',
			}}>
			<Router>
				<MainLayout />
			</Router>
			<ToastContainer />
		</Auth0Provider>
	)
}

export default App
