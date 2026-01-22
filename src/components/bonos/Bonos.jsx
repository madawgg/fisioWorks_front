import { getBonos, deleteBono } from "../../api/bono.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Spinner, Badge } from "react-bootstrap";
import Header from "../layouts/Header.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { toast } from "react-toastify";

export default function Bonos() {
  const navigate = useNavigate();
  const [bonos, setBonos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin");
  const canCreate = isAdmin;

  useEffect(() => {
    getBonos()
      .then((data) => setBonos(data.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (id) => {
    navigate(`/bonos/${id}/edit`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("¿Seguro que quieres eliminar este bono?");
    if (!confirmed) return;

    try {
      await deleteBono(id);
      toast.success("Bono eliminado correctamente");
      setBonos(bonos.filter((bono) => bono.id !== id));
      navigate("/bonos");
    } catch {
      toast.error("Error al eliminar el bono");
    }
  };

  if (loading)
    return (
      <>
        <Header 
          title="Bonos" 
          subtitle="Gestión de bonos y paquetes"
        />
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
        <Header 
          title="Bonos" 
          subtitle="Gestión de bonos y paquetes"
        />
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
        title="Bonos"
        subtitle={`${bonos.length} bono${
          bonos.length !== 1 ? "s" : ""
        } disponible${bonos.length !== 1 ? "s" : ""}`}
      />
      <div className="container-fluid px-4 pt-3">
        {canCreate && (
          <button
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={() => navigate("/bonos/new")}
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
            Nuevo Bono
          </button>
        )}
      </div>
      <div className="container-fluid px-4 py-3">
        <div className="row g-4">
          {bonos.map((bono) => (
            <div key={bono.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
              <Card
                className="h-100 shadow-sm border-0"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/bonos/${bono.id}`)}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="fw-bold mb-0">
                      {bono.name}
                    </Card.Title>
                    <Badge bg="olive" className="ms-2">
                      {bono.sessions} sesiones
                    </Badge>
                  </div>

                  {bono.description && (
                    <Card.Text className="text-muted small mb-3">
                      {bono.description.length > 100
                        ? `${bono.description.substring(0, 100)}...`
                        : bono.description}
                    </Card.Text>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="fw-bold text-success fs-5">
                      {bono.price
                        ? `${parseFloat(bono.price).toFixed(2)}€`
                        : "Sin precio"}
                    </span>
                    {isAdmin && (
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-dark"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(bono.id);
                          
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(bono.id);
                          }}
                        >
                          Borrar
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

