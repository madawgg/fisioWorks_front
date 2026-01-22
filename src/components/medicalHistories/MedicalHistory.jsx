import { useParams } from "react-router-dom";
import { getMedicalHistory } from "../../api/medicalHistory.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export default function MedicalHistory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const isAdmin = currentUser?.roles?.includes("admin");
  const isTherapist = currentUser?.roles?.includes("therapist");
  const canEdit = isAdmin || isTherapist;
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMedicalHistory(id)
      .then((data) => setMedicalHistory(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <>
        <Header
          title="Detalles del Historial Clínico"
          backButton={true}
        />
        <DetailLayout loading={loading} />
      </>
    );

  if (error)
    return (
      <>
        <Header
          title="Detalles del Historial Clínico"
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );

  if (!medicalHistory)
    return (
      <>
        <Header
          title="Detalles del Historial Clínico"
          backButton={true}
        />
        <div className="container py-5">
          <div className="alert alert-warning" role="alert">
            No se encontró el historial clínico.
          </div>
        </div>
      </>
    );

  return (
    <>
      <Header
        title="Historial Clínico"
        subtitle={
          medicalHistory.patient?.full_name
            ? `Paciente: ${medicalHistory.patient.full_name}`
            : ""
        }
        backButton={true}
      />

      <div className="container-fluid px-4 py-3">
        {/* Botones de acción */}
        {canEdit && (
          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              className="btn btn-outline-dark d-flex align-items-center gap-2"
              onClick={() => navigate(`/medical-histories/${id}/edit`)}
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
          </div>
        )}

        <DetailLayout maxWidth="100%">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-success text-white fw-bold py-2">
                  <i className="bi bi-file-medical me-2"></i>
                  Información del Historial Clínico
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Paciente */}
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <small className="text-muted text-uppercase fw-semibold">
                          Paciente
                        </small>
                        <p className="mb-0 fw-medium">
                          {medicalHistory.patient?.full_name || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Terapeuta */}
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <small className="text-muted text-uppercase fw-semibold">
                          Terapeuta
                        </small>
                        <p className="mb-0 fw-medium">
                          {medicalHistory.therapist?.full_name || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Fecha de creación */}
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <small className="text-muted text-uppercase fw-semibold">
                          Fecha de Consulta
                        </small>
                        <p className="mb-0 fw-medium">
                          {medicalHistory.created_at
                            ? new Date(
                                medicalHistory.created_at
                              ).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Fecha de actualización */}
                    {medicalHistory.updated_at && (
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <small className="text-muted text-uppercase fw-semibold">
                            Última Actualización
                          </small>
                          <p className="mb-0 fw-medium">
                            {new Date(
                              medicalHistory.updated_at
                            ).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Nota */}
                    <div className="col-12">
                      <div className="mb-0">
                        <small className="text-muted text-uppercase fw-semibold">
                          Nota
                        </small>
                        <div className="mt-2 p-3 bg-light rounded border">
                          <p className="mb-0 text-break">
                            {medicalHistory.note || "Sin nota registrada."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DetailLayout>
      </div>
    </>
  );
}

