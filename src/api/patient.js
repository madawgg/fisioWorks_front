import apiClient from "./apiClient.js";

export const getPatients = () => apiClient.get("/patients");

export const getPatient = async (id) => {
  const response = await apiClient.get(`/patients/${id}`);
  return response.data.data; 
};

export const createPatient = (data) => apiClient.post("/patients", data);
export const updatePatient = (id, data) => apiClient.patch(`/patients/${id}`, data);
export const deletePatient = (id) => apiClient.delete(`/patients/${id}`);
export const restorePatient = (id) => apiClient.patch(`/patients/${id}/restore`);
export const getPatientAppointments = (id) => apiClient.get(`/patient/${id}/appointments`);
export const getSelfAppointments = () => apiClient.get(`/appointments/me`);
export const getSelfAppointment = (id) => apiClient.get(`/appointments/me/${id}`);