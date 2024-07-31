import { getAxiosInstance } from "../utils/axios";

export const listAllPrompts = async () => {
    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance.get(`/prompts`);
      return response;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error");
      }
    }
};


export const updatePrompt = async (prompt_id : string, promptData: any) => {
    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance.put(`/prompts/${prompt_id}`, promptData);
      return response;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error");
      }
    }
};

export const addPrompt = async (promptData: any) => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.post(`/prompts/`, promptData);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
};

export const deletePrompt = async (prompt_id: string) => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.delete(`/prompts/${prompt_id}`);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
};