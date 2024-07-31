import { getAxiosInstance } from '../utils/axios'

export const getChannelDetails = async (channelId: string) => {
	try {
		const axiosInstance = await getAxiosInstance()
		const response = await axiosInstance.get(`/channels/results/${channelId}`)
		return response
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}

export const listAllChannels = async (details: boolean) => {
	try {
		const axiosInstance = await getAxiosInstance()
		return await axiosInstance.get(`/channel`)
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}
