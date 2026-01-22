import apiClient from "./apiClient.js";

export const getTherapists = () => apiClient.get("/therapists");

export const getTherapist = async (id) => {
  const response = await apiClient.get(`/therapists/${id}`);
  return response.data.data; 
};

export const createTherapist = (data) => apiClient.post("/therapists", data);
export const updateTherapist = (id, data) => apiClient.patch(`/therapists/${id}`, data);
export const deleteTherapist = (id) => apiClient.delete(`/therapists/${id}`);
export const restoreTherapist = (id) => apiClient.patch(`/therapists/${id}/restore`);
export const getTherapistAppointments = (id) => apiClient.get(`/therapist/${id}/appointments`);
export const getFreeTherapists = (start, duration) => 
  apiClient.get("/free-therapists", { params: { start, duration } });
