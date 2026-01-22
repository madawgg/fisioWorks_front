import apiClient from "./apiClient.js";

export const getAppointments = () => 
  apiClient.get("/appointments");

export const getAppointment = async (id) => {
  const response = await apiClient.get(`/appointments/${id}`);
  return response.data.data;
};

export const createAppointment = (data) =>
  apiClient.post("/appointments", data);

export const updateAppointment = (id, data) =>
  apiClient.patch(`/appointments/${id}`, data);

export const deleteAppointment = (id) =>
  apiClient.delete(`/appointments/${id}`);

export const restoreAppointment = (id) =>
  apiClient.patch(`/appointments/${id}/restore`);

export const purchaseAppointment = (data) =>
  apiClient.post(`/purchase-appointment`, data);

export const getFreeHours = (therapist_id, date, treatment_id) =>
  apiClient.get(`/free-hours/${therapist_id}/${date}/${treatment_id}`);
