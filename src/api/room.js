import apiClient from "./apiClient.js";

export const getRooms = () => apiClient.get("/rooms");


export const getRoom = async (id) => {
  const response = await apiClient.get(`/rooms/${id}`);
  return response.data.data; 
};

export const createRoom = (data) => apiClient.post("/rooms", data);
export const updateRoom = (id, data) => apiClient.patch(`/rooms/${id}`, data);
export const deleteRoom = (id) => apiClient.delete(`/rooms/${id}`);
export const restoreRoom = (id) => apiClient.patch(`/rooms/${id}/restore`);
export const getEmptyRooms = (start, duration) => 
  apiClient.get("/empty-rooms", { params: { start, duration } });