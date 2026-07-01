import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Sidebar from "./Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../hooks/useAuth.js";

export default function MainLayout() {
  const { isDemo } = useAuth();

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
      <Sidebar />
      <div className="flex-grow-1" style={{ overflow: "auto" }}>
        {isDemo && (
          <div className="bg-warning text-dark text-center py-2 px-3 fw-semibold small sticky-top">
            🔒 Modo demo — solo lectura. Los cambios no se guardarán.
          </div>
        )}
        <Suspense
          fallback={
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100%" }}
            >
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

