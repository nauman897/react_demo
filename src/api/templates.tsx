import { getAxiosInstance } from "../utils/axios";

export const listTemplates = async () => {
    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance.get(`/report-builder`);
      return response;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error");
      }
    }
};

export const listTemplatePrompt = async (template_key : string | undefined) => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.get(`/report-builder/${template_key}`);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.Message) {
      throw new Error(error.response.data.Message);
    } else {
      throw new Error("Unknown error");
    }
  }
};

export const updateCurrentTemplatePrompt = async (template_key : string | undefined, promptData : any) => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.put(`/report-builder/${template_key}`, promptData);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
};

export const createNewTemplatePrompt = async (promptData : any) => {
  try {
    console.log("prompt data: ", promptData)
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.post(`/report-builder`, promptData);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
};

export const deleteSelectedTemplate = async (template_key : any, deleteFromChannels : boolean) => {
  try {
    const axiosInstance = await getAxiosInstance();
    if(deleteFromChannels){
        const response = await axiosInstance.delete(`/report-builder/${template_key}?delete_reports=true`);
        return response;
    }
    else{
        const response = await axiosInstance.delete(`/report-builder/${template_key}`);
        return response;
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
};


export const listReportResponse = async (template_key : string) => {
  try {
    const axiosInstance = await getAxiosInstance();
    console.log(template_key)
    const response = await axiosInstance.get(`/report-builder/${template_key}`);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
};

//post a request to process a channel for a template
export const postReportRequest = async (template_id:string, request_data : any) => {
  try {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.post(`/report-builder/${template_id}/test/`, request_data);
    console.log("Response : ", response);
    
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
};

export const releaseTemplate = async (template_id : string) => {
  try{
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.post(`/report-builder/${template_id}/release`);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
} 

// delete a template version
export const deleteTemplateVersion = async (channel_id : string | undefined, template_id : string | undefined, requested_at:string) => {
  try{
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.delete(`/report/${channel_id}/${template_id}/${encodeURIComponent(requested_at)}`);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Unknown error");
    }
  }
} 


// 
export const regenerateChannelReportForTemplate = async (channel_id :string | undefined, template_id : string) => {
  try{
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance.post(`/report/${channel_id}/${template_id}`);
    return response;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.Message) {
      throw new Error(error.response.data.Message);
    } else {
      throw new Error("Unknown error");
    }
  }
} 