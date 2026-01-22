import React, { useState, useEffect, useRef } from "react";
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
  getUserRole,
} from "../api/auth.js";

import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const hasToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!hasToken);

  const hasVerifiedTokenRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedTokenRef.current) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    hasVerifiedTokenRef.current = true;

    getCurrentUser()
      .then(async (userData) => {
        const userInfo = userData.data || userData;

        const rolesResponse = await getUserRole();
        const roles = rolesResponse.data?.roles || rolesResponse.roles || rolesResponse.data || [];

        const finalUser = { ...userInfo, roles };

        setUser(finalUser);
        setIsAuthenticated(true);

        localStorage.setItem("user", JSON.stringify(finalUser));
      })
      .catch((error) => {
        console.error("Error al verificar token:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        } else {
          console.warn("Error no crítico, mantenemos sesión");
          setIsAuthenticated(true);
        }
      });
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);

      const token = response.token || response.data?.token;

      if (!token) throw new Error("No se recibió token");

      localStorage.setItem("token", token);

      // Obtener datos completos del usuario (incluye patient/therapist)
      const userDataResponse = await getCurrentUser();
      const userData = userDataResponse.data || userDataResponse;

      const rolesResponse = await getUserRole();
      const roles = rolesResponse.data?.roles || rolesResponse.roles || rolesResponse.data || [];

      const finalUser = { ...userData, roles };

      setUser(finalUser);
      localStorage.setItem("user", JSON.stringify(finalUser));

      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
