import apiClient from "./apiClient.js";

export const getAdmins = () => apiClient.get("/admins");

export const getAdmin = async (id) => {
  const response = await apiClient.get(`/admins/${id}`);
  return response.data.data; 
};

export const createAdmin = (data) => apiClient.post("/admins", data);
export const updateAdmin = (id, data) => apiClient.patch(`/admins/${id}`, data);
export const deleteAdmin = (id) => apiClient.delete(`/admins/${id}`);
export const restoreAdmin = (id) => apiClient.patch(`/admins/${id}/restore`);

/**
 * Verifica si un usuario es administrador
 * @param {number|string} userId - ID del usuario a verificar
 * @returns {Promise<boolean>} - true si es admin, false si no
 */
export const isAdmin = async (userId) => {
  try {
    const response = await getAdmins();
    const admins = response.data?.data || response.data || [];
    
    // Verificar si el userId está en la lista de admins
    const isUserAdmin = admins.some(admin => {
      // Comparar como string para evitar problemas con tipos
      return String(admin.user_id) === String(userId) || String(admin.id) === String(userId);
    });
    
    return isUserAdmin;
  } catch (error) {
    console.error("Error al verificar si es admin:", error.response?.data || error.message);
    return false;
  }
};

