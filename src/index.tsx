import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { StrictMode } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { POSTHOG_API_KEY, POSTHOG_HOST } from './constants'

posthog.init('phc_bgDVAHj7kPnMeEsjGRfFut4HHnL0cztMV3MW1Q2xF2M', {
	api_host: 'https://us.i.posthog.com',
	person_profiles: 'identified_only',
	disable_session_recording: true,
})

posthog.init('phc_bgDVAHj7kPnMeEsjGRfFut4HHnL0cztMV3MW1Q2xF2M', {
	api_host: 'https://us.i.posthog.com',
	person_profiles: 'identified_only',
	disable_session_recording: true,
})

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<PostHogProvider client={posthog}>
			<App />
		</PostHogProvider>
	</StrictMode>
)
