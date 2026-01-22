import { getTreatments, deleteTreatment } from "../../api/treatment.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Header from "../layouts/Header.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { toast } from "react-toastify";

export default function Treatments() {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin");
  const canCreate = isAdmin;

  useEffect(() => {
    getTreatments()
      .then((data) => setTreatments(data.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  
  const handleDelete = (treatmentId, e) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que deseas eliminar este tratamiento?")) {
      deleteTreatment(treatmentId)
        .then(() => {
          setTreatments(treatments.filter((t) => t.id !== treatmentId));
          toast.success("Tratamiento eliminado correctamente");
        })
        .catch((err) => {
          toast.error("Error al eliminar el tratamiento: " + err.message);
        });
    }
  };
  if (loading)
    return (
      <>
        <Header title="Tratamientos" subtitle="Catálogo de servicios" />
        <div
          className="d-flex justify-content-center align-items-center w-100"
          style={{ minHeight: "60vh" }}
        >
          <Spinner animation="border" className="text-olive" />
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Header title="Tratamientos" subtitle="Catálogo de servicios" />
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </>
    );

  return (
    <>
      <Header
        title="Tratamientos"
        subtitle={`${treatments.length} tratamiento${
          treatments.length !== 1 ? "s" : ""
        } disponible${treatments.length !== 1 ? "s" : ""}`}
      />
      <div className="container-fluid px-4 pt-3">
        {canCreate && (
          <button
            className="btn btn-success text-white d-flex align-items-center gap-2"
            onClick={() => navigate("/treatments/new")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-plus-lg"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
              />
            </svg>
            Nuevo Tratamiento
          </button>
        )}
      </div>
      <div className="container-fluid px-4 py-3">
        <div className="row g-4 justify-content-start">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="col-12 col-md-6 col-lg-4">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/treatments/${treatment.id}`)}
              >
                <div className="card-body d-flex flex-column bg-light">
                  <h5 className="card-title fw-bold text-uppercase">
                    {treatment.name}
                  </h5>
                  <p className="card-text mb-2 text-olive fs-4 fw-bold">
                    {treatment.price}€
                  </p>
                  <p className="card-text text-muted">
                    {treatment.description}
                  </p>
                  {canCreate && (
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-outline-dark d-flex align-items-center gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/treatments/${treatment.id}/edit`);
                          }}
                          title="Editar tratamiento"
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger d-flex align-items-center gap-2"
                        onClick={(e) => handleDelete(treatment.id, e)}
                        title="Eliminar tratamiento"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
