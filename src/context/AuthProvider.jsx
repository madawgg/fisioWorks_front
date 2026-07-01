import React, { useState, useEffect, useRef } from "react";
import {
  login as loginApi,
  demoLogin as demoLoginApi,
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
  const [isDemo, setIsDemo] = useState(localStorage.getItem("demo") === "true");

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
        console.error("Error al verificar token:", error.response?.data || error.message);

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
      localStorage.removeItem("demo");
      setIsDemo(false);

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
      console.error("Error en login:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  };

  const loginDemo = async () => {
    try {
      const response = await demoLoginApi();

      const token = response.token || response.data?.token;

      if (!token) throw new Error("No se recibió token");

      localStorage.setItem("token", token);
      localStorage.setItem("demo", "true");
      setIsDemo(true);

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
      console.error("Error en login demo:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar la demo",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Error al cerrar sesión:", error.response?.data || error.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("demo");
      setUser(null);
      setIsAuthenticated(false);
      setIsDemo(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isDemo, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
