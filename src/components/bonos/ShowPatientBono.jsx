import { useParams } from "react-router-dom";
import { getPatientBono } from "../../api/patientBono.js";
import { useState, useEffect } from "react";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";

export default function ShowPatientBono() {
  const { id } = useParams();
  const [patientBono, setPatientBono] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPatientBono(id)
      .then((data) => setPatientBono(data))
      .catch(() => setError("Error al cargar el bono del paciente"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Header title="Detalles de Bono del Paciente" backButton={true} />
        <DetailLayout loading={loading} />
      </>
    );
  }

  if (error || !patientBono) {
    return (
      <>
        <Header title="Detalles de Bono del Paciente" backButton={true} />
        <DetailLayout error={error || "No se encontró el bono"} />
      </>
    );
  }

  const statusColor = patientBono.status ? "success" : "danger";
  const statusText = patientBono.status ? "Activo" : "Inactivo";

  return (
    <>
      <Header
        title={patientBono.bono?.name || "Bono"}
        subtitle={`Bono de ${patientBono.patient?.full_name || "paciente"}`}
        backButton={true}
      />

      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            {/* Tarjeta principal */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <span className="fw-bold">
                  <i className="bi bi-ticket-perforated me-2"></i>
                  Información del Bono
                </span>
                <span className={`badge bg-${statusColor}`}>{statusText}</span>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  {/* Información del bono */}
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                        Nombre del Bono
                      </small>
                      <p className="mb-0 fs-5 fw-medium text-success">
                        {patientBono.bono?.name || "—"}
                      </p>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                        Precio
                      </small>
                      <p className="mb-0 fs-4 fw-bold text-success">
                        {patientBono.bono?.price || "0"}€
                      </p>
                    </div>
                  </div>

                  {/* Información de sesiones */}
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                        Sesiones
                      </small>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary fs-6 rounded-pill px-3 py-2">
                          {patientBono.sessions_remaining}
                        </span>
                        <span className="text-muted">
                          de {patientBono.bono?.sessions}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                        Gastado
                      </small>
                      <div className="progress" style={{ height: "25px" }}>
                        <div
                          className="progress-bar bg-olive"
                          role="progressbar"
                          style={{
                            width: `${
                              ((patientBono.bono?.sessions -
                                patientBono.sessions_remaining) /
                                patientBono.bono?.sessions) *
                              100
                            }%`,
                          }}
                          aria-valuenow={
                            patientBono.bono?.sessions -
                            patientBono.sessions_remaining
                          }
                          aria-valuemin="0"
                          aria-valuemax={patientBono.bono?.sessions}
                        >
                          {Math.round(
                            ((patientBono.bono?.sessions -
                              patientBono.sessions_remaining) /
                              patientBono.bono?.sessions) *
                              100
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Fechas */}
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                      Fecha de Compra
                    </small>
                    <p className="mb-0">
                      
                      {patientBono.created_at
                        ? new Date(patientBono.created_at).toLocaleDateString(
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
                  <div className="col-12 col-md-4">
                    <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                      Fecha de vencimiento
                    </small>
                    <p className="mb-0">
                      
                        {patientBono.expiration_date
                        ? new Date(patientBono.expiration_date).toLocaleDateString(
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
                  <div className="col-12 col-md-4">
                    <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                      Último Uso
                    </small>
                    <p className="mb-0">
                      {patientBono.updated_at
                        ? new Date(patientBono.updated_at).toLocaleDateString(
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
          </div>
        </div>
      </div>
    </>
  );
}

