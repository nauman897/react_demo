import { getAxiosInstance } from '../utils/axios'

export const listChannelStats = async (id: string | undefined) => {
	if(id){
		try {
			const axiosInstance = await getAxiosInstance()
			const response = await axiosInstance.get(`/channel/${id}/stats`)
			return response
		} catch (error: any) {
			if (error.response && error.response.data && error.response.data.message) {
				throw new Error(error.response.data.message)
			} else {
				throw new Error('Unknown error')
			}
		}
	}
}

export const listVideoStats = async (id: string | undefined) => {
	if(id){
		try {
			const axiosInstance = await getAxiosInstance()
			const response = await axiosInstance.get(`/video/${id}/stats`)
			return response
		} catch (error: any) {
			if (error.response && error.response.data && error.response.data.message) {
				throw new Error(error.response.data.message)
			} else {
				throw new Error('Unknown error')
			}
		}
	}
}