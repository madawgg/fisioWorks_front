import { useParams } from "react-router";
import { getTreatment } from "../../api/treatment.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";
import { Button } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth.js";

export default function Treatment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = user?.roles?.includes("admin");

  const isTherapist = user?.roles?.includes("therapist");
  const canEdit = isTherapist || isAdmin;

  useEffect(() => {
    getTreatment(id)
      .then((data) => setTreatment(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEdit = () => navigate(`/treatments/${id}/edit`);
  
  // Reservar cita para sí mismo (como paciente)
  const handleReserve = (treatment) => {
    navigate("/agenda", {
      state: {
        user_id: user?.id,
        treatment_id: treatment.id,
        treatment: treatment,
      },
    });
  };

  // Crear cita para un paciente (como therapist/admin)
  const handleReserveForPatient = (treatment) => {
    navigate("/agenda", {
      state: {
        treatment_id: treatment.id,
        treatment: treatment,
        forPatient: true,
      },
    });
  };

  if (loading)
    return (
      <>
        <Header 
          title="Detalles del Tratamiento" 
          backButton={true}
        />
        <DetailLayout loading={loading} />
      </>
    );

  if (error) 
    return (
      <>
        <Header 
          title="Detalles del Tratamiento" 
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );
    
  if (!treatment)
    return (
      <>
        <Header 
          title="Detalles del Tratamiento" 
          backButton={true}
        />
        <DetailLayout error="No se encontró el tratamiento" />
      </>
    );

  return (
    <>
      <Header
        title={treatment.name}
        subtitle={`${treatment.price}€`}
        backButton={true}
      />
      <div className="container-fluid px-4 pt-3">
        {canEdit && (
        <button
          className="btn btn-outline-dark d-flex align-items-center gap-2"
          onClick={handleEdit}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-pencil"
            viewBox="0 0 16 16"
          >
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
          </svg>
          Editar
        </button>
        )}
      </div>
      <div className="container-fluid px-4 py-3">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm bg-light border-0">
              <div className="card-body p-4">
                <div className="mb-4">
                  <h6 className="text-uppercase text-success fs-5 fw-bold mb-2">
                    Precio
                  </h6>
                  <p className="fs-3 fw-bold text-olive mb-0">
                    {treatment.price}€
                  </p>
                </div>
                
                <div>
                  <h6 className="text-uppercase text-success fs-5 fw-bold mb-2">
                    Descripción
                  </h6>
                  <p className="mb-0 text-muted fs-5">{treatment.description}</p>
                  <div className="d-flex flex-column gap-2 mt-3">
                    <Button
                      variant="success"
                      onClick={() => handleReserve(treatment)}
                      className="w-100"
                    >
                      <i className="bi bi-calendar-plus me-2 text-white"></i>
                      <span className="text-white">Reservar cita</span>
                    </Button>
                    {isTherapist && (
                      <Button
                        variant="outline-success"
                        onClick={() => handleReserveForPatient(treatment)}
                        className="w-100"
                      >
                        <i className="bi bi-person-plus me-2"></i>
                        Cita para paciente
                      </Button>
                    )}
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
