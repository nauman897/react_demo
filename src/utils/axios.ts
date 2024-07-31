import axios from "axios";
import { BACKEND_URL } from "../constants";

export const getAxiosInstance = async () => {
  const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
  });
  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers.Accept = "application/json";
      config.headers["Content-Type"] = "application/json";

      return config;
    },
    (error) => {
      console.error(error);
      return Promise.reject(error);
    }
  );
  return axiosInstance;
};
