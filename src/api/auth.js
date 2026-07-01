import apiClient from "./apiClient.js";

export const login = async (email, password) => {
  const response = await apiClient.post("/login", { email, password });
  return response.data;
};

export const demoLogin = async () => {
  const response = await apiClient.post("/demo-login");
  return response.data;
};

export const logout = async () => {
  try {
    await apiClient.post("/logout");
  } catch (error) {
    console.error("Error al cerrar sesión:", error.response?.data || error.message);
  }
};

export const getCurrentUser = async () => {
  const response = await apiClient.get("/user");
  return response.data;
};

export const getUserRoles = async () => {
  const response = await apiClient.get("/user/roles");
  return response.data;
};
export const getUserRole = async () => {
  const response = await apiClient.get("/current-user/roles");
  return response.data;
};
