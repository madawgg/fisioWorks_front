import apiClient from "./apiClient.js";

/**
 * Registrar un nuevo usuario (ruta pública)
 * Crea el usuario y automáticamente lo registra como paciente
 */
export const register = async (userData) => {
  const response = await apiClient.post("/register", userData);
  return response.data;
};

