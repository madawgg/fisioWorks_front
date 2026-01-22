import apiClient from "./apiClient.js";

export const getPatientBonos = () => apiClient.get("/patient-bonos");

export const getPatientBono = async (id) => {
  const response = await apiClient.get(`/patient-bonos/${id}`);
  return response.data.data;
};

export const createPatientBono = (data) =>
  apiClient.post("/patient-bono", data);

export const updatePatientBono = (id, data) =>
  apiClient.patch(`/patient-bono/${id}`, data);

export const deletePatientBono = (id) =>
  apiClient.delete(`/patient-bono/${id}`);

export const restorePatientBono = (id) =>
  apiClient.patch(`/patient-bono/${id}/restore`);

export const buyPatientBono = (data) => apiClient.post("/buy-bono", data);

export const getPatientBonosByPatientId = (patient_id) =>
  apiClient.get(`/patient-bonos/patient/${patient_id}`);

export const getActivePatientBonosByPatientId = (patient_id) =>
  apiClient.get(`/patient-bonos/active/patient/${patient_id}`);