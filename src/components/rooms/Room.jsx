import { useParams } from "react-router-dom";
import { getRoom } from "../../api/room.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ListGroup } from "react-bootstrap";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";

export default function Room() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEquipment, setShowEquipment] = useState(false);

  useEffect(() => {
    getRoom(id)
      .then((data) => setRoom(data))
      .catch(() => setError("Error al cargar la habitación"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <>
        <Header 
          title="Detalles de Habitación" 
          backButton={true}
        />
        <DetailLayout loading={loading} />
      </>
    );

  if (error) 
    return (
      <>
        <Header 
          title="Detalles de Habitación" 
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );

  return (
    <>
      <Header 
        title={room.name} 
        subtitle={`Sala Nº ${room.id} - ${room.place}`}
        backButton={true}
      />
      <div className="container-fluid px-4 pt-3">
        <button
          className="btn btn-outline-dark d-flex align-items-center gap-2"
          onClick={() => navigate(`/rooms/${room.id}/edit`)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
          </svg>
          Editar
        </button>
      </div>
      <div className="container-lg px-4 py-3">
        <div className="row ">
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="mb-4">
                  <h6 className="text-uppercase text-success fw-bold mb-3">Ubicación</h6>
                  <p className="mb-0">{room.place}</p>
                </div>

                <div>
                  <div className="d-flex  align-items-center mb-3">
                    <h6 className="text-uppercase text-success fw-bold mb-0 me-3">Equipamiento</h6>
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => setShowEquipment(!showEquipment)}
                    >
                      {showEquipment ? "Ocultar" : "Mostrar"}
                    </Button>
                  </div>

                  {showEquipment && (
                    <ListGroup>
                      {room.equipment?.length > 0 ? (
                        room.equipment.map((item, idx) => (
                          <ListGroup.Item key={idx}>{item}</ListGroup.Item>
                        ))
                      ) : (
                        <ListGroup.Item className="text-muted">
                          No hay equipamiento registrado
                        </ListGroup.Item>
                      )}
                    </ListGroup>
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
