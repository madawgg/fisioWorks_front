import { useParams } from "react-router-dom";
import { getSpecialty } from "../../api/specialty.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";

export default function Specialty() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSpecialty(id)
      .then((data) => setSpecialty(data))
      .catch(() => setError("Error al cargar la especialidad"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <>
        <Header
          title="Detalles de Especialidad"
          backButton={true}
        />
        <DetailLayout loading={loading} />
      </>
    );

  if (error)
    return (
      <>
        <Header
          title="Detalles de Especialidad"
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );

  return (
    <>
      <Header
        title={specialty.name}
        subtitle={`Especialidad Nº ${specialty.id}`}
        backButton={true}
      />
      <div className="container-fluid px-4 pt-3">
        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => navigate(`/specialties/${specialty.id}/edit`)}
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
      </div>
      <div className="container-lg px-4 py-3">
        <div className="row">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {specialty.description && (
                  <div className="mb-4">
                    <h6 className="text-uppercase text-success fw-bold mb-3">
                      Descripción
                    </h6>
                    <p className="mb-0">{specialty.description}</p>
                  </div>
                )}

                <div>
                  <h6 className="text-uppercase text-success fw-bold mb-3">
                    Detalles
                  </h6>
                  {specialty.details?.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {specialty.details.map((detail, idx) => (
                        <li key={idx} className="list-group-item px-0">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">
                      No hay detalles registrados
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

