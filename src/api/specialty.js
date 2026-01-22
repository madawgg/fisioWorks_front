import apiClient from "./apiClient.js";

export const getSpecialties = () => apiClient.get("/specialties");


export const getSpecialty = async (id) => {
  const response = await apiClient.get(`/specialties/${id}`);
  return response.data.data; 
};

export const createSpecialty = (data) => apiClient.post("/specialties", data);
export const updateSpecialty = (id, data) => apiClient.patch(`/specialties/${id}`, data);
export const deleteSpecialty = (id) => apiClient.delete(`/specialties/${id}`);
export const restoreSpecialty = (id) => apiClient.patch(`/specialties/${id}/restore`);