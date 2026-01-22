import apiClient from "./apiClient.js";

export const getUsers = () => apiClient.get("/users");

export const getUser = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data.data; 
};

export const createUser = (data) => apiClient.post("/users", data);
export const updateUser = (id, data) => apiClient.patch(`/users/${id}`, data);
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);
export const restoreUser = (id) => apiClient.patch(`/users/${id}/restore`);
export const addPatientToTherapist = (id) => apiClient.post(`/add-patient-to-therapist/${id}`);
export const changeTherapistToPatient = (id) => apiClient.post(`/change-therapist-to-patient/${id}`);
export const getUserProfile = () => apiClient.get(`/users/profile`);
export const updateSelf = (data) => apiClient.patch(`/users/me`, data);
export const getUsersRoles = () => apiClient.get(`/users-roles`);
export const getUserRoleById = (id) => apiClient.get(`/users/${id}/roles`);