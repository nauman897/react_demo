import { getAxiosInstance } from "../utils/axios";

export const listChannelVideos = async (channel_id : string) => {
    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance.get(`/channel/${channel_id}/videos`);
      return response;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error");
      }
    }
};

export const currentVideoAnalysis = async (video_id : string | undefined) => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get(`/video/${video_id}/analysis`);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
};

export const listVideoDetails = async (video_id : string|undefined) => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get(`/video/${video_id}`);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
};