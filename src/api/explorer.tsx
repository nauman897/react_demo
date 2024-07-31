import { getAxiosInstance } from '../utils/axios'
import axios from 'axios'

const resourceBucket = '/second-brain/documents'

export const getPresignedUrl = async (fileName: string, fileId?: string) => {
	try {
		const axiosInstance = await getAxiosInstance()
		let url = `${resourceBucket}/presigned-url?file_name=${fileName}`
		if (fileId) {
			url = `${url}&file_id=${fileId}`
		}
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

export const postPresignedUrl = async (presignedUrl: string, formData: any) => {
	try {
		const response = await axios.post(presignedUrl, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		return response
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}

export const getUploadedDocuments = async () => {
	try {
		const axiosInstance = await getAxiosInstance()
		const response = await axiosInstance.get(resourceBucket)
		return response
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}

export const deleteDocument = async (fileId: string) => {
	try {
		const axiosInstance = await getAxiosInstance()
		const response = await axiosInstance.delete(`${resourceBucket}/${fileId}`)
		return response
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}

export const downloadDocument = async (fileId: string) => {
	try {
		const axiosInstance = await getAxiosInstance()
		const response = await axiosInstance.get(`${resourceBucket}/download/${fileId}`)
		return response
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}

export const readDocument = async (url: string) => {
	try {
		const response = await axios.get(url)
		return response.data
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}

export const ingestFile = async (fileData: any) => {
	try {
		const axiosInstance = await getAxiosInstance()
		const response = await axiosInstance.post(`${resourceBucket}/ingest`, fileData)
		return response
	} catch (error: any) {
		if (error.response && error.response.data && error.response.data.message) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error('Unknown error')
		}
	}
}
