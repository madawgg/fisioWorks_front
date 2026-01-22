import apiClient from "./apiClient.js";

export const getTreatments = () => apiClient.get("/treatments");


export const getTreatment = async (id) => {
  const response = await apiClient.get(`/treatments/${id}`);
  return response.data.data; 
};

export const createTreatment = (data) => apiClient.post("/treatments", data);
export const updateTreatment = (id, data) => apiClient.patch(`/treatments/${id}`, data);
export const deleteTreatment = (id) => apiClient.delete(`/treatments/${id}`);