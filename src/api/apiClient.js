import axios from "axios";
import { toast } from "react-toastify";

const apiClient = axios.create({
  // Configurable por entorno (VITE_API_URL). Fallback a localhost para desarrollo.
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de peticiones - Añadir token automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuestas - Manejar errores 401 y redirigir a login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibo un 401, el token expiró o es inválido
    if (error.response?.status === 401) {
      console.warn("Token inválido o expirado (401)");
      //Borrar token
      localStorage.removeItem("token");
      //Borrar user
      localStorage.removeItem("user");
      localStorage.removeItem("demo");
      //Redirigir a login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // 403: acción no permitida (p. ej. escritura en modo demo de solo lectura)
    if (error.response?.status === 403) {
      const message =
        error.response?.data?.message ||
        "Acción no permitida en modo demo (solo lectura).";
      toast.warning(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;