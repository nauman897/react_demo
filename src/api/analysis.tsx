import { getAxiosInstance } from '../utils/axios'
import { ChannelAnalysisRequestData } from '../components/Interfaces'


export const listAllExecutions = async (nextPageToken?: string | null) => {
	try {
		const axiosInstance = await getAxiosInstance()
		const url = nextPageToken
			? `/analysis?nextPageToken=${encodeURIComponent(nextPageToken)}`
			: '/analysis'
		const response = await axiosInstance.get(url)
		return response
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}


export const getDetailedAnalysis = async (analysisId: string) => {
	try {
		const axiosInstance = await getAxiosInstance()
		const response = await axiosInstance.get(`analysis/${analysisId}`)
		return response
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}

// ingest channel
export const ingestChannel = async (channel_id:string) => {
	try{
		const axiosInstance = await getAxiosInstance();
		const response = await axiosInstance.get(`/channel/${channel_id}/videos/ingest`);
		return response;
	} 
	catch (error: any) {
		if (error.response && error.response.data) {
            throw error.response;
        } else {
            throw new Error('Unknown error');
        }
	}
}

// check if channel is already ingested or not
export const checkIfChannelIngested = async (channel_handle:string | null) => {
	try{
		const axiosInstance = await getAxiosInstance();
		const response = await axiosInstance.get(`/channel/ingestion_status/${channel_handle}`);
		return response;
	} 
	catch (error: any) {
		if (error.response && error.response.data) {
            throw error.response;
        } else {
            throw new Error('Unknown error');
        }
	}
}

// get video
export const getVideo = async (video_id:string|null) => {
	try{
		const axiosInstance = await getAxiosInstance();
		const response = await axiosInstance.get(`/video/${video_id}/ingest`);
		return response;
	}
	catch (error: any) {
		if (error.response && error.response.data) {
            throw error.response;
        } else {
            throw new Error('Unknown error');
        }
	}
}

//get channel videos
export const getChannelVideos = async (channel_id : string) => {
	try{
		const axiosInstance = await getAxiosInstance();
		const response = await axiosInstance.get(`/channel/${channel_id}/query`);
		return response;
	} 
	catch (error: any) {
		if (error.response && error.response.data) {
            throw error.response;
        } else {
            throw new Error('Unknown error');
        }
	}
}
// https://8656sb74x2.execute-api.us-east-1.amazonaws.com/api/channel/UC04FyDIvYXNecpbG8gyOw4A/query?title_substring=meta&end_date=2024-06-30&start_date=2023-12-01&order=desc&sort_by=publishedAt&n=5
export const getChannelVideosWithFilters = async (channel_id : string, title_substring : string, end_date : string, 
	start_date :string, order:string, sort_by : string, page_num : number) => {
	try{
		const axiosInstance = await getAxiosInstance();
	
		let url = `/channel/${channel_id}/query?`;

		if(page_num!=1){
			url += `page=${encodeURIComponent(page_num)}&`;	
		}
		if (title_substring !== '') {
			url += `title_substring=${encodeURIComponent(title_substring)}&`;
		}
		if (end_date !== '') {
			url += `end_date=${encodeURIComponent(end_date)}&`;
		}
		if (start_date !== '') {
			url += `start_date=${encodeURIComponent(start_date)}&`;
		}
		if (order !== '') {
			url += `order=${encodeURIComponent(order)}&`;
		}
		if (sort_by !== '') {
			url += `sort_by=${encodeURIComponent(sort_by)}&`;
		}
		

		// Remove the trailing '&' or '?' if any
		url = url.slice(0, -1);

		const response = await axiosInstance.get(url);
		return response;
	} 
	catch (error: any) {
		if (error.response && error.response.data) {
            throw error.response;
        } else {
            throw new Error('Unknown error');
        }
	}
}

export const createAnalysisExecution = async (req: ChannelAnalysisRequestData) => {
	try {
		const axiosInstance = await getAxiosInstance()
		const response = await axiosInstance.post('/analysis', req)
		return response
	} catch (error: any) {
		if (error.response && error.response.data) {
			const errorMessage = error.response.data.Message;
			throw new Error(errorMessage);
		} else {
			throw new Error('Unknown error');
		}
	}
}
