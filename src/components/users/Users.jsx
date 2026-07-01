import { getUsers, deleteUser, restoreUser, getUsersRoles } from "../../api/user.js";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth.js";
import Header from "../layouts/Header.jsx";
import "./Users.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PAGE_SIZE = 10;

export default function Users() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = currentUser?.roles?.includes("admin");
  

  // Ref para evitar llamadas duplicadas
  const hasLoadedRef = useRef(false);

  // Ref para cache de usuarios en memoria
  const usersCacheRef = useRef(null);
  const rolesLoadedRef = useRef(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: "",
    email: "",
    role: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    loadUsers();
    // Ejecución única controlada por hasLoadedRef; loadUsers no necesita ir en deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async (forceReload = false) => {
    setLoading(true);
    try {
      if (!forceReload && usersCacheRef.current) {
        setUsers(usersCacheRef.current);
        setLoading(false);
        lazyLoadRoles();
        return;
      }

      const data = await getUsers();
      const sortedUsers = data.data.data.sort((a, b) => {
        if (a.deleted_at && !b.deleted_at) return 1;
        if (!a.deleted_at && b.deleted_at) return -1;
        return 0;
      });

      setUsers(sortedUsers);
      usersCacheRef.current = sortedUsers;

      lazyLoadRoles();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lazyLoadRoles = async () => {
    if (rolesLoadedRef.current) return;
    rolesLoadedRef.current = true;

    try {
      const response = await getUsersRoles();
      const rolesData = response.data?.data || response.data || [];
      
      // Convertir a objeto { userId: [roles] } para soportar múltiples roles
      let rolesMap = {};
      if (Array.isArray(rolesData)) {
        rolesData.forEach((item) => {
          const userId = item.user_id || item.id;
          // Guardar todos los roles del usuario (array)
          const roles = item.roles || (item.role ? [item.role] : []);
          if (userId) {
            rolesMap[userId] = roles;
          }
        });
      }
      
      setUserRoles(rolesMap);
    } catch (error) {
      console.error("Error al cargar roles:", error.response?.data || error.message);
    }
  };


  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.search) {
        const fullName = `${user.name} ${user.surname}`.toLowerCase();
        if (!fullName.includes(filters.search.toLowerCase())) return false;
      }

      if (
        filters.email &&
        !user.email.toLowerCase().includes(filters.email.toLowerCase())
      )
        return false;
      if (filters.role !== "all") {
        // Buscar roles del usuario (ahora es un array)
        const userRolesArray = userRoles[user.id] || userRoles[String(user.id)] || [];
        // Verificar si el usuario TIENE el rol buscado
        if (!userRolesArray.includes(filters.role)) return false;
      }
      return true;
    });
  }, [users, filters, userRoles]);

  // Paginación en cliente sobre la lista ya filtrada.
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  // Volver a la primera página al cambiar los filtros.
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Ajustar la página si la lista se encoge (p. ej. tras eliminar un usuario).
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));
  const clearFilters = () =>
    setFilters({ search: "", email: "", role: "all" });

  const handleDelete = async (userId, e) => {
    e.stopPropagation();

    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteUser(userId); 

        hasLoadedRef.current = false;

        await loadUsers(true); 
        toast.success("Usuario eliminado correctamente");
      } catch (err) {
        toast.error("Error al eliminar el usuario: " + err.message);
      }
    }
  };

  const handleRestore = async (userId, e) => {
    e.stopPropagation();
    if (window.confirm("¿Deseas restaurar este usuario?")) {
      try {
        await restoreUser(userId);
        hasLoadedRef.current = false;
        await loadUsers(true);
      } catch (err) {
        alert("Error al restaurar el usuario: " + err.message);
      }
    }
  };

  if (loading)
    return (
      <>
        <Header title="Usuarios" subtitle="Gestión de usuarios del sistema" />
        <div
          className="d-flex justify-content-center text-olive align-items-center vh-50"
          style={{ marginTop: "45vh" }}
        >
          <Spinner animation="border" />
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Header title="Usuarios" subtitle="Gestión de usuarios del sistema" />
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </>
    );

  const activeUsers = filteredUsers.filter((u) => !u.deleted_at);
  const deletedUsers = filteredUsers.filter((u) => u.deleted_at);
  const hasActiveFilters =
    filters.search || filters.email || filters.role !== "all";

  return (
    <>
      <Header
        title="Usuarios"
        subtitle={`${activeUsers.length} activo${
          activeUsers.length !== 1 ? "s" : ""
        } ${
          deletedUsers.length > 0
            ? `• ${deletedUsers.length} eliminado${
                deletedUsers.length !== 1 ? "s" : ""
              }`
            : ""
        }`}
      />
      {isAdmin && (
        <div className="container-fluid px-4 pt-3">
          <button
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={() => navigate("/users/new")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-plus"
              viewBox="0 0 16 16"
            >
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
            </svg>
            Nuevo Usuario
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="container-fluid px-4 py-3">
        <div className="card shadow-sm border-0 mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3 mb-3">
              <h6 className="mb-0 text-success fw-semibold d-flex align-items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                </svg>
                Filtros
              </h6>
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small text-muted mb-1">
                  Nombre o Apellidos
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar por nombre o apellidos..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small text-muted mb-1">
                  Email
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Buscar por email..."
                  value={filters.email}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small text-muted mb-1">Rol</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="therapist">Terapeuta</option>
                  <option value="patient">Paciente</option>
                </select>
              </div>
              {hasActiveFilters && (
                <div className="col-md-3 d-flex align-items-bottom">  
                <button
                  className="btn btn-sm btn-outline-secondary mt-auto mb-0"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </button>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-top">
                <small className="text-muted">
                  Mostrando <strong>{filteredUsers.length}</strong> de{" "}
                  <strong>{users.length}</strong> usuarios
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 pb-3">
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-success">
                  <tr>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Apellidos</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <div className="d-flex flex-column align-items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                          </svg>
                          <p className="mb-0">
                            No se encontraron usuarios con los filtros aplicados
                          </p>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={clearFilters}
                          >
                            Limpiar filtros
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const isDeleted = !!user.deleted_at;

                      return (
                        <tr
                          key={user.id}
                          onClick={() =>
                            !isDeleted && navigate(`/users/${user.id}`)
                          }
                          style={{ cursor: isDeleted ? "default" : "pointer" }}
                          className={`${!isDeleted ? "table-row-hover" : ""} ${
                            isDeleted ? "user-deleted" : ""
                          }`}
                        >
                          <td
                            className={`py-3 px-4 fw-medium ${
                              isDeleted ? "text-muted" : ""
                            }`}
                          >
                            <div className="d-flex align-items-center gap-2">
                              {user.name}
                              {isDeleted && (
                                <span className="badge bg-secondary small">
                                  Eliminado
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              isDeleted ? "text-muted" : ""
                            }`}
                          >
                            {user.surname}
                          </td>
                          <td
                            className={`py-3 px-4 text-muted ${
                              isDeleted ? "fst-italic" : ""
                            }`}
                          >
                            {user.email}
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              isDeleted ? "text-muted" : ""
                            }`}
                          >
                            {user.phone}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div
                              className="d-flex gap-2 justify-content-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {!isDeleted ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                                    onClick={() =>
                                      navigate(`/users/${user.id}/edit`)
                                    }
                                    title="Editar usuario"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      fill="currentColor"
                                      className="bi bi-pencil"
                                      viewBox="0 0 16 16"
                                    >
                                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                    </svg>
                                    Editar
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                    onClick={(e) => handleDelete(user.id, e)}
                                    title="Eliminar usuario"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      fill="currentColor"
                                      className="bi bi-trash"
                                      viewBox="0 0 16 16"
                                    >
                                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                      <path
                                        fillRule="evenodd"
                                        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                      />
                                    </svg>
                                    Eliminar
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                  onClick={(e) => handleRestore(user.id, e)}
                                  title="Restaurar usuario"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    fill="currentColor"
                                    className="bi bi-arrow-counterclockwise"
                                    viewBox="0 0 16 16"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"
                                    />
                                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
                                  </svg>
                                  Restaurar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-3 mt-4 mb-2">
            <button
              className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
              </svg>
              Anterior
            </button>

            <span className="text-muted small">
              Página <strong className="text-success">{currentPage}</strong> de{" "}
              <strong>{totalPages}</strong>
            </span>

            <button
              className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
            >
              Siguiente
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
