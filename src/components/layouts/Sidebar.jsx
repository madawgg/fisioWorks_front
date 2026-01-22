import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

export default function Sidebar() {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const toggleSidebar = () => setShow(!show);
  const { user } = useAuth();

  const isAdmin = user?.roles?.includes("admin");
  const isTherapist = user?.roles?.includes("therapist");

 const navItems = isAdmin
   ? [
      { to: "/users", label: "Usuarios", match: "/users" },
      { to: "/agenda", label: "Agenda", match: "/agenda" },
      { to: "/treatments", label: "Tratamientos", match: "/treatments" },
      { to: "/rooms", label: "Habitaciones", match: "/rooms" },
      { to: "/bonos", label: "Bonos", match: "/bonos" },
      { to: "/specialties", label: "Especialidades", match: "/specialties" },
     ]
   : isTherapist
   ? [
      { to: "/users", label: "Usuarios", match: "/users" },
      { to: "/agenda", label: "Agenda", match: "/agenda" },
      { to: "/treatments", label: "Tratamientos", match: "/treatments" },
      { to: "/rooms", label: "Habitaciones", match: "/rooms" },
      { to: "/bonos", label: "Bonos", match: "/bonos" },
     ]
   : [
      { to: "/agenda", label: "Agenda", match: "/agenda" },
      { to: "/treatments", label: "Tratamientos", match: "/treatments" },
      { to: "/bonos", label: "Bonos", match: "/bonos" },
     ];


  const sidebarWidth = 290;

  return (
    <>
      {/* Sidebar Desktop */}
      <div
        className="d-none d-md-flex flex-column bg-dark p-3"
        style={{ minWidth: sidebarWidth, height: "100vh" }}
      >
        <Link
          to="/"
          className="rounded d-flex flex-column align-items-center mt-3 text-olive text-decoration-none fs-1 fw-bold"
        >
          FisioWorks
          <span className="mt-0 fs-4">Agenda</span>
        </Link>

        <div className="card mt-4 mb-4 flex-column border-1"></div>

        <ul className="nav nav-pills flex-column fs-4 gap-3">
          {navItems.map((item) => (
            <li
              key={item.to}
              className={`nav-item ${
                location.pathname.startsWith(item.match)
                  ? "active bg-olive ps-5 rounded"
                  : ""
              }`}
            >
              <Link to={item.to} className="nav-link text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Sidebar Móvil (Offcanvas) */}
      <div
        className={`offcanvas offcanvas-start ${show ? "show" : ""}`}
        tabIndex="-1"
        style={{ visibility: show ? "visible" : "hidden" }}
      >
        <div className="offcanvas-header bg-dark text-white">
          <h5 className="offcanvas-title">Menú</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={toggleSidebar}
          ></button>
        </div>
        <div
          className="offcanvas-body bg-dark p-3"
          style={{ maxHeight: "100vh", overflowY: "auto" }}
        >
          <ul className="nav nav-pills flex-column fs-5 gap-3">
            {navItems.map((item) => (
              <li key={item.to} className="nav-item">
                <Link
                  to={item.to}
                  className="nav-link text-white"
                  onClick={() => setShow(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {show && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Botón menú móvil */}
      <button 
        className="btn btn-dark d-md-none position-fixed top-0 start-0 m-3" 
        onClick={toggleSidebar}
        style={{ zIndex: 1000 }}
      >
        ☰
      </button>
    </>
  );
}
