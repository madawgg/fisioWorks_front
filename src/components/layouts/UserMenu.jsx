import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { Link } from "react-router-dom";

export default function UserMenu() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-0"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ border: "none" }}
      >
        <div className="text-end d-none d-sm-block">
          <div className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>
            {user?.name || "Usuario"}
          </div>
          <small className="text-muted" style={{ fontSize: "0.75rem" }}>
            {user?.email || ""}
          </small>
        </div>
        <div
          className="rounded-circle bg-success d-flex align-items-center justify-content-center"
          style={{ width: "40px", height: "40px", minWidth: "40px" }}
        >
          <span className="text-white fw-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="text-dark"
          viewBox="0 0 16 16"
        >
          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
        </svg>
      </button>

      {showDropdown && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded shadow-lg border"
          style={{ minWidth: "220px", zIndex: 1050 }}
        >
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center me-2"
                style={{ width: "40px", height: "40px" }}
              >
                <span className="text-white fw-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <div className="fw-bold text-dark">{user?.name || "Usuario"}</div>
                <small className="text-muted">{user?.email || ""}</small>
              </div>
            </div>
          </div>
          <div>
            <Link to={`/current-user/profile`} 
            className="text-decoration-none text-dark p-2 d-block text-center">Perfil</Link></div>
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
                />
                <path
                  fillRule="evenodd"
                  d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

