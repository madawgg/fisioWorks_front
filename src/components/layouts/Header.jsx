import React from "react";
import { useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu.jsx";

export default function Header({ 
  title, 
  subtitle, 
  backButton = false, 
  backPath = null
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white shadow-sm border-bottom sticky-top" style={{ zIndex: 100 }}>
      <div className="container-fluid px-4 py-3">
        {/* Desktop Layout */}
        <div className="d-none d-md-flex align-items-center justify-content-between">
          {/* Left section - Back button and title */}
          <div className="d-flex align-items-center gap-3">
            {backButton && (
              <button
                onClick={handleBack}
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                style={{ minWidth: "auto" }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  fill="currentColor" 
                  className="bi bi-arrow-left" 
                  viewBox="0 0 16 16"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                  />
                </svg>
                <span>Volver</span>
              </button>
            )}
            <div>
              <h3 className="mb-0 fw-bold text-dark">{title}</h3>
              {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
            </div>
          </div>

          {/* Right section - User Menu */}
          <UserMenu />
        </div>

        {/* Mobile Layout - Título centrado */}
        <div className="d-md-none">
          <div className="d-flex align-items-center justify-content-between mb-2">
            {/* Espacio para el botón del sidebar (invisible pero ocupa espacio) */}
            <div style={{ width: "56px" }}></div>
            
            {/* Título centrado */}
            <div className="text-center flex-grow-1">
              <h4 className="mb-0 fw-bold text-dark">{title}</h4>
            </div>
            
            {/* User Menu */}
            <UserMenu />
          </div>
          
          {/* Back button y subtitle en móvil */}
          {(backButton || subtitle) && (
            <div className="d-flex flex-column gap-2 mt-2">
              {backButton && (
                <button
                  onClick={handleBack}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 align-self-start"
                  style={{ minWidth: "auto" }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    fill="currentColor" 
                    className="bi bi-arrow-left" 
                    viewBox="0 0 16 16"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                    />
                  </svg>
                  <span>Volver</span>
                </button>
              )}
              {subtitle && <p className="text-muted mb-0 small text-center">{subtitle}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

