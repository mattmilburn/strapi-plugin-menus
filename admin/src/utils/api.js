import axiosInstance from "./axios-instance";
import getRequestUrl from "./get-request-url";

const api = {
  get: async (id, params) => {
    const {data} = await axiosInstance.get(getRequestUrl(id, params));

    return data;
  },

  postAction: (body) => {
    return axiosInstance.post(getRequestUrl(), body);
  },

  putAction: (id, body) => {
    return axiosInstance.put(getRequestUrl(id), body);
  },

  deleteAction: (id) => {
    return axiosInstance.delete(getRequestUrl(id));
  },
};

export default api;
