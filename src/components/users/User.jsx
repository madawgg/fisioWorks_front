import { useParams, useLocation } from "react-router";
import { getUser, deleteUser, restoreUser } from "../../api/user.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";
import { getActivePatientBonosByPatientId } from "../../api/patientBono.js";
import { getPatientMedicalHistories, getSelfMedicalHistories } from "../../api/medicalHistory.js";
import PatientAppointments from "../patients/PatientAppointments.jsx";
import TherapistAppointments from "../therapists/TherapistAppointments.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export default function User() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user: currentUser } = useAuth();

  // Verificar si el usuario actual es admin o terapeuta
  const isCurrentUserAdmin = currentUser?.roles?.includes?.("admin");
  const isCurrentUserTherapist = currentUser?.roles?.includes("therapist");
  const canManageMedicalHistory = isCurrentUserAdmin || isCurrentUserTherapist;
  
  // Verificar si el usuario actual es SOLO paciente (sin otros roles)
  const isOnlyPatient = currentUser?.roles?.includes("patient") && 
                        !isCurrentUserAdmin && 
                        !isCurrentUserTherapist;

  // Si estoy en /current-user/profile, usar "me"
  const userId = location.pathname === "/current-user/profile" ? "me" : id;
  const isProfileView = userId === "me";

  const [user, setUser] = useState(null);
  const [patientBonos, setPatientBonos] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBonos, setLoadingBonos] = useState(false);
  const [loadingMedicalHistory, setLoadingMedicalHistory] = useState(false);
  const [error, setError] = useState(null);

  // Datos del usuario
  useEffect(() => {
    loadUser(userId);
  }, [userId]);

  const loadUser = (id) => {
    setLoadingUser(true);
    getUser(id)
      .then((data) => setUser(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingUser(false));
  };

  // Determinar si el usuario es paciente y/o terapeuta
  const isPatient = !!user?.patient;
  const isTherapist = !!user?.therapist;
  const patientId = user?.patient?.id;
  const therapistId = user?.therapist?.id;

  // Bonos del usuario (solo si hay usuario cargado y es paciente)
  useEffect(() => {
    if (!user || !isPatient) {
      setPatientBonos([]);
      return;
    }

    // Usar el patientId que ya está definido arriba (user?.patient?.id)
    if (!patientId) {
      setPatientBonos([]);
      return;
    }

    setLoadingBonos(true);
    getActivePatientBonosByPatientId(patientId)
      .then((data) => setPatientBonos(data.data?.data || []))
      .catch(() => setPatientBonos([]))
      .finally(() => setLoadingBonos(false));
  }, [patientId, user, isPatient]);

  // Historial médico del paciente
  useEffect(() => {
    // Si es el perfil propio, usar getSelfMedicalHistories
    if (isProfileView && isPatient) {
      setLoadingMedicalHistory(true);
      getSelfMedicalHistories()
        .then((data) => setMedicalHistory(data.data?.data || data.data || []))
        .catch(() => setMedicalHistory(null))
        .finally(() => setLoadingMedicalHistory(false));
      return;
    }

    // Si no es perfil propio, usar getPatientMedicalHistories con patientId
    if (!patientId) {
      setMedicalHistory(null);
      return;
    }

    setLoadingMedicalHistory(true);
    getPatientMedicalHistories(patientId)
      .then((data) => setMedicalHistory(data.data?.data || data.data || []))
      .catch(() => setMedicalHistory(null))
      .finally(() => setLoadingMedicalHistory(false));
  }, [patientId, isProfileView, isPatient]);
 
  // Determinar si el usuario es paciente y/o terapeuta


  const handleEdit = () => {
    if (userId === "me") {
      navigate("/current-user/profile/edit");
    } else {
      navigate(`/users/${userId}/edit`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteUser(userId);
        navigate("/users");
      } catch (err) {
        alert("Error al eliminar el usuario: " + err.message);
      }
    }
  };

  const handleRestore = async () => {
    if (window.confirm("¿Deseas restaurar este usuario?")) {
      try {
        await restoreUser(userId);
        loadUser(userId);
      } catch (err) {
        alert("Error al restaurar el usuario: " + err.message);
      }
    }
  };

  if (loadingUser)
    return (
      <>
        <Header
          title="Detalles del Usuario"
          backButton={true}
        />
        <DetailLayout loading={loadingUser} />
      </>
    );

  if (error)
    return (
      <>
        <Header
          title="Detalles del Usuario"
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );

  const isDeleted = !!user?.deleted_at;

  // Vista mobile-first para pacientes sin rol de terapeuta/admin
  if (isOnlyPatient && isProfileView) {
    return (
      <>
        <Header
          title={user ? `${user.name} ${user.surname}` : "Mi Perfil"}
          subtitle={user?.email || ""}
          backButton={false}
        />

        <div className="container-fluid px-3 py-3">
          {/* Botón de editar perfil */}
          <div className="d-flex justify-content-end mb-3">
            <button
              className="btn btn-outline-dark btn-sm d-flex me-auto align-items-center gap-2"
              onClick={handleEdit}
            >
              Editar Perfil
            </button>
          </div>

          {/* Información personal */}
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header bg-success text-white fw-bold py-2">
              Información Personal
            </div>
            <div className="card-body p-3">
              <div className="mb-3">
                <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                  Teléfono
                </small>
                <p className="mb-0">
                  {user.phone || "—"}
                </p>
              </div>
              <div className="mb-3">
                <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                  Email
                </small>
                <p className="mb-0 text-break">
                  {user.email || "—"}
                </p>
              </div>
              <div className="mb-3">
                <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                  Dirección
                </small>
                <p className="mb-0">
                  {user.address || "—"}
                </p>
              </div>
              <div className="mb-3">
                <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                  DNI
                </small>
                <p className="mb-0">
                  {user.dni || "—"}
                </p>
              </div>
              <div className="mb-0">
                <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                  Fecha de Nacimiento
                </small>
                <p className="mb-0">
                  {user.birthdate
                    ? new Date(user.birthdate).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Mis Bonos */}
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header bg-success text-white fw-bold py-2 d-flex justify-content-between align-items-center">
              <span>
                Mis Bonos
              </span>
              {patientBonos.length > 0 && (
                <span className="badge bg-white text-success">
                  {patientBonos.length}
                </span>
              )}
            </div>
            <div className="card-body p-0">
              {loadingBonos ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" className="text-olive" />
                  <span className="ms-2">Cargando bonos...</span>
                </div>
              ) : patientBonos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0 mt-2">No tienes bonos activos.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {patientBonos.map((bono, index) => (
                    <div
                      key={index}
                      className="list-group-item list-group-item-action"
                      onClick={() => navigate(`/patient-bonos/${bono.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0 fw-bold text-success">
                          {bono.bono?.name || "—"}
                        </h6>
                        <span
                          className={`badge ${
                            bono.status ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {bono.status ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted">
                            {new Date(bono.created_at).toLocaleDateString("es-ES")}
                          </small>
                        </div>
                        <div>
                          <span className="badge bg-primary rounded-pill px-3">
                            {bono.sessions_remaining} sesiones
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historial Médico */}
          {isPatient && (
            <div className="card shadow-sm border-0 mb-3">
              <div className="card-header bg-success text-white fw-bold py-2">
                Historial Clínico
              </div>
              <div className="card-body p-0">
                {loadingMedicalHistory ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-olive" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <span className="ms-2">Cargando historial...</span>
                  </div>
                ) : !medicalHistory || medicalHistory.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-file-medical text-muted" style={{ fontSize: "2rem" }}></i>
                    <p className="text-muted mb-0 mt-2">
                      Sin historial clínico registrado.
                    </p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {medicalHistory.map((history) => (
                      <div
                        key={history.id}
                        className="list-group-item list-group-item-action"
                        onClick={() => navigate(`/medical-histories/${history.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <small className="text-muted">
                            <i className="bi bi-calendar3 me-1"></i>
                            {history.created_at
                              ? new Date(history.created_at).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </small>
                          <small className="text-muted">
                            {history.therapist?.full_name || "—"}
                          </small>
                        </div>
                        <p className="mb-0 text-truncate">
                          {history.note || "Sin anotaciones"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mis Citas */}
          {isPatient && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-success text-white fw-bold py-2">
                Mis Citas
              </div>
              <div className="card-body p-0">
                <PatientAppointments patientId={patientId} />
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Vista normal para admin/therapist o vista de otros usuarios
  return (
    <>
      <Header
        title={user ? `${user.name} ${user.surname}` : "Usuario"}
        subtitle={
          user ? (isDeleted ? `${user.email} • Eliminado` : user.email) : ""
        }
        backButton={true}
      />

      <div className="container-fluid px-4 py-3">
        {/* Botones de acción */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {!isDeleted ? (
            <>
              <button
                className="btn btn-outline-dark d-flex align-items-center gap-2"
                onClick={() => handleEdit(user?.id)}
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
                className="btn btn-outline-danger d-flex align-items-center gap-2"
                onClick={handleDelete}
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
              {/* Botón para añadir historial médico - solo admin/terapeuta y si es paciente */}
              {canManageMedicalHistory && isPatient && medicalHistory && (
                <button
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  onClick={() =>
                    navigate(`/users/${user.id}/medical-history/create`)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="currentColor"
                    className="bi bi-file-medical"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.5 4.5a.5.5 0 0 0-1 0v.634l-.549-.317a.5.5 0 1 0-.5.866L7 6l-.549.317a.5.5 0 1 0 .5.866l.549-.317V7.5a.5.5 0 1 0 1 0v-.634l.549.317a.5.5 0 1 0 .5-.866L9 6l.549-.317a.5.5 0 1 0-.5-.866l-.549.317V4.5zM5.5 9a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 2a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z" />
                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" />
                  </svg>
                  Añadir Historial Clínico
                </button>
              )}
            </>
          ) : (
            <button
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={handleRestore}
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

        {/* Alert de usuario eliminado */}
        {isDeleted && (
          <div
            className="alert alert-warning d-flex align-items-center gap-2"
            role="alert"
          >
            Este usuario ha sido eliminado. Puedes restaurarlo usando el botón
            de arriba.
          </div>
        )}

        <DetailLayout maxWidth="100%">
          {user && (
            <>
              {/* FILA SUPERIOR: Información + Historial Médico (si paciente) + Bonos */}
              <div className="row g-3 mb-3">
                {/* Tarjeta de contacto */}
                <div
                  className={`col-12 ${
                    isPatient ? "col-lg-4 col-xl-3" : "col-lg-4"
                  }`}
                >
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-success text-white fw-bold py-2">
                      <i className="bi bi-person-circle me-2"></i>
                      Información
                    </div>
                    <div className="card-body py-3">
                      <div className="mb-3">
                        <small className="text-muted text-uppercase fw-semibold">
                          Teléfono
                        </small>
                        <p className="mb-0 fw-medium">{user.phone || "—"}</p>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted text-uppercase fw-semibold">
                          Email
                        </small>
                        <p className="mb-0 fw-medium text-break">
                          {user.email || "—"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted text-uppercase fw-semibold">
                          Dirección
                        </small>
                        <p className="mb-0 fw-medium">{user.address || "—"}</p>
                      </div>
                      <hr className="my-2" />
                      <div className="mb-3">
                        <small className="text-muted text-uppercase fw-semibold">
                          DNI
                        </small>
                        <p className="mb-0 fw-medium">{user.dni || "—"}</p>
                      </div>
                      <div className="mb-0">
                        <small className="text-muted text-uppercase fw-semibold">
                          Fecha de nacimiento
                        </small>
                        <p className="mb-0">
                          {user.birthdate
                            ? new Date(user.birthdate).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historial Médico - Solo si es paciente */}
                {isPatient && (
                  <div className="col-12 col-lg-4 col-xl-5">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-success text-white fw-bold py-2">
                        <i className="bi bi-file-medical me-2"></i>
                        Historial Clínico
                      </div>
                      <div className="card-body overflow-auto p-0">
                        {loadingMedicalHistory ? (
                          <div className="text-center py-4">
                            <div
                              className="spinner-border spinner-border-sm text-olive"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Cargando...
                              </span>
                            </div>
                            <span className="ms-2">Cargando historial...</span>
                          </div>
                        ) : !medicalHistory ? (
                          <div className="text-center py-4">
                            <i
                              className="bi bi-file-medical text-muted"
                              style={{ fontSize: "2rem" }}
                            ></i>
                            <p className="text-muted mb-0 mt-2">
                              Sin historial clínico registrado.
                            </p>
                          </div>
                        ) : (
                          <div
                            className="table-responsive"
                            style={{ maxHeight: "250px", overflowY: "auto" }}
                          >
                            <table className="table table-hover table-sm mb-0">
                              <thead className="sticky-top bg-light">
                                <tr>
                                  <th className="ps-3">Fecha</th>
                                  <th>Terapeuta</th>
                                  <th>Anotación</th>
                                </tr>
                              </thead>
                              <tbody>
                                {medicalHistory.map((history) => (
                                  <tr
                                    key={history.id}
                                    onClick={() =>
                                      navigate(
                                        `/medical-histories/${history.id}`
                                      )
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <td className="ps-3">
                                      {history.created_at
                                        ? new Date(
                                            history.created_at
                                          ).toLocaleDateString("es-ES", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })
                                        : "—"}
                                    </td>
                                    <td>
                                      {history.therapist?.full_name || "—"}
                                    </td>
                                    <td className="text-break">
                                      {history.note && history.note.length > 20
                                        ? history.note.substring(0, 20) + "..."
                                        : history.note || "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tarjeta de Bonos */}
                <div
                  className={`col-12 ${
                    isPatient ? "col-lg-4 col-xl-4" : "col-lg-8"
                  }`}
                >
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-success text-white fw-bold py-2 d-flex justify-content-between align-items-center">
                      <span>
                        <i className="bi bi-ticket-perforated me-2"></i>
                        Bonos del usuario
                      </span>
                      {patientBonos.length > 0 && (
                        <span className="badge bg-white text-success">
                          {patientBonos.length} bono
                          {patientBonos.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="card-body overflow-auto flex-grow-1 p-0">
                      {loadingBonos ? (
                        <div className="text-center py-4">
                          <div
                            className="spinner-border spinner-border-sm text-olive"
                            role="status"
                          >
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                          <span className="ms-2">Cargando bonos...</span>
                        </div>
                      ) : patientBonos.length === 0 ? (
                        <div className="text-center py-4">
                          <i
                            className="bi bi-inbox text-muted"
                            style={{ fontSize: "2rem" }}
                          ></i>
                          <p className="text-muted mb-0 mt-2">
                            Este usuario no tiene bonos.
                          </p>
                        </div>
                      ) : (
                        <div
                          className="table-responsive"
                          style={{ maxHeight: "250px", overflowY: "auto" }}
                        >
                          <table className="table table-hover table-sm mb-0">
                            <thead className="sticky-top bg-light">
                              <tr>
                                <th className="ps-3">Bono</th>
                                <th className="text-center">Sesiones</th>
                                <th>Fecha</th>
                                <th className="text-center">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {patientBonos.map((bono, index) => (
                                <tr
                                  key={index}
                                  onClick={() =>
                                    navigate(`/patient-bonos/${bono.id}`)
                                  }
                                  style={{ cursor: "pointer" }}
                                  className="table-row-hover"
                                >
                                  <td className="ps-3 fw-medium">
                                    {bono.bono?.name || "—"}
                                  </td>
                                  <td className="text-center">
                                    <span className="badge bg-primary rounded-pill px-3">
                                      {bono.sessions_remaining}
                                    </span>
                                  </td>
                                  <td>
                                    {new Date(
                                      bono.created_at
                                    ).toLocaleDateString("es-ES")}
                                  </td>
                                  <td className="text-center">
                                    <span
                                      className={`badge ${
                                        bono.status ? "bg-success" : "bg-danger"
                                      }`}
                                    >
                                      {bono.status ? "Activo" : "Inactivo"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* FILA INFERIOR: Citas */}
              <div className="row g-3">
                {/* Si es terapeuta: Citas como terapeuta primero */}
                {isTherapist && (
                  <div className="col-12">
                    <div
                      className="card shadow-sm border-0 d-flex flex-column"
                      style={{ maxHeight: "350px" }}
                    >
                      <div className="card-header bg-success text-white fw-bold py-2">
                        Citas como Terapeuta
                      </div>
                      <div className="card-body overflow-auto flex-grow-1 p-0">
                        <TherapistAppointments therapistId={therapistId} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Citas como paciente */}
                {isPatient && (
                  <div className="col-12">
                    <div
                      className="card shadow-sm border-0 d-flex flex-column"
                      style={{ maxHeight: "350px" }}
                    >
                      <div className="card-header bg-success text-white fw-bold py-2">
                        Citas como Paciente
                      </div>
                      <div className="card-body overflow-auto flex-grow-1 p-0">
                        <PatientAppointments patientId={patientId} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Si no es paciente ni terapeuta, mostrar mensaje */}
                {!isPatient && !isTherapist && (
                  <div className="col-12">
                    <div className="card shadow-sm border-0">
                      <div className="card-header bg-success text-white fw-bold py-2">
                        Citas
                      </div>
                      <div className="card-body d-flex align-items-center justify-content-center py-4">
                        <div className="text-center">
                          <i
                            className="bi bi-calendar-x text-muted"
                            style={{ fontSize: "2rem" }}
                          ></i>
                          <p className="text-muted mb-0 mt-2">
                            El usuario no es paciente ni terapeuta.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DetailLayout>
      </div>
    </>
  );
}
