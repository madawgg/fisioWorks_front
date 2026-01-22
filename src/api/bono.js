import apiClient from "./apiClient.js";

export const getBonos = () => apiClient.get("/bonos");

export const getBono = async (id) => {
  const response = await apiClient.get(`/bonos/${id}`);
  return response.data.data; 
};

export const createBono = (data) => apiClient.post("/bonos", data);
export const updateBono = (id, data) => apiClient.patch(`/bonos/${id}`, data);
export const deleteBono = (id) => apiClient.delete(`/bonos/${id}`);
export const restoreBono = (id) => apiClient.patch(`/bonos/${id}/restore`);
