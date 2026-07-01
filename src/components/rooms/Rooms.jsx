import { getRooms, deleteRoom } from "../../api/room.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spinner, ListGroup } from "react-bootstrap";
import Header from "../layouts/Header.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

export default function Rooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRooms()
      .then((data) => setRooms(data.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (roomId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta habitación?")) {
      deleteRoom(roomId).then(() => {
        setRooms(rooms.filter((room) => room.id !== roomId));
        toast.success(`Habitación ${rooms.find((room) => room.id === roomId).name} eliminada correctamente`);
      }).catch((err) => {
        toast.error("Error al eliminar la habitación: " + err.message);
      });
    }
  };

  if (loading)
    return (
      <>
        <Header 
          title="Habitaciones" 
          subtitle="Gestión de salas y espacios"
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
          title="Habitaciones" 
          subtitle="Gestión de salas y espacios"
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
        title="Habitaciones"
        subtitle={`${rooms.length} habitación${
          rooms.length !== 1 ? "es" : ""
        } disponible${rooms.length !== 1 ? "s" : ""}`}
      />
      <div className="container-fluid px-4 pt-3">
        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => navigate("/rooms/new")}
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
          Nueva Habitación
        </button>
      </div>
      <div className="container-fluid px-4 py-3">
        <div className="row table-responsive g-4">
          <table className="table table-hover mb-0">
            <thead className="table-success">
              <tr>
                <th className="py-3 col-4">Nombre</th>
                <th className="py-3 col-2">Ubicación</th>
                <th className="py-3 col-2 text-center">Nº de habitacion</th>
                <th className="py-3 text-center col-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} onClick={() => navigate(`/rooms/${room.id}`)} style={{ cursor: "pointer" }}>
                  <td>{room.name}</td>
                  <td>{room.place}</td>
                  <td className="text-center">
                   {room.id}
                  </td>
                  <td className="text-center ">
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        size="sm"
                        variant="outline-dark"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/rooms/${room.id}/edit`);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(room.id);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
