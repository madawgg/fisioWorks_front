import apiClient from "./apiClient.js";

export const getPatientMedicalHistories = (id) =>
  apiClient.get(`/medical-histories/patient/${id}`);

export const getMedicalHistory = async (id) => {
  const response = await apiClient.get(`/medical-histories/${id}`);
  return response.data.data;
};

export const createMedicalHistory = (data) =>
  apiClient.post("/medical-histories", data);

export const updateMedicalHistory = (id, data) =>
  apiClient.patch(`/medical-histories/${id}`, data);

export const deleteMedicalHistory = (id) =>
  apiClient.delete(`/medical-histories/${id}`);

export const getSelfMedicalHistories = () =>
  apiClient.get("/medical-histories/patient/me");
