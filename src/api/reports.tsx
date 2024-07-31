import { getAxiosInstance } from "../utils/axios";

export const listChannelReports = async (channel_id : string) => {
    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance.get(`/report/${channel_id}`);
      return response;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error");
      }
    }
};

export const listTemplateSpecificChannelReports = async (channel_name : string, template_id: string) => {
    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance.get(`/report/${channel_name}/${template_id}`);
      return response;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error");
      }
    }
};

export const listChannelReportsVersion = async (channel_name : string | undefined, template_id: string | undefined) => {
  if(channel_name && template_id){
      try {
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance.get(`/report/${channel_name}/${template_id}/all`);
        return response;
      } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        } else {
          throw new Error("Unknown error");
        }
    }
  }
};


export const listPreviousVersionReport = async (channel_id : string | undefined, template_id:string | undefined, requested_at:string) => {
  console.log(requested_at);
    
    if(channel_id && template_id){
      try{
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance.get(`/report/${channel_id}/${template_id}?requested_at=${encodeURIComponent(requested_at)}`);
        return response;
      }
      catch (error : any){
        throw new Error(error.response.data.message)
      }
    }
}
