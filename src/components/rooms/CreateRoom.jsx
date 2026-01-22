import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../api/room.js";
import { Button, Form, ListGroup } from "react-bootstrap";
import Header from "../layouts/Header.jsx";
import { toast } from "react-toastify";

export default function CreateRoom() {
  const navigate = useNavigate();

  const [room, setRoom] = useState({ name: "", place: "", equipment: [] });
  const [error, setError] = useState(null);
  const [newEquipment, setNewEquipment] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEquipment = () => {
    if (!newEquipment.trim()) return;

    setRoom((prev) => ({
      ...prev,
      equipment: [
        ...prev.equipment,
        { name: newEquipment.trim(), deleted: false },
      ],
    }));
    setNewEquipment("");
  };

  const handleSoftDelete = (index) => {
    const updated = [...room.equipment];
    updated[index].deleted = true;
    setRoom({ ...room, equipment: updated });
  };

  const handleRestore = (index) => {
    const updated = [...room.equipment];
    updated[index].deleted = false;
    setRoom({ ...room, equipment: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...room,
        equipment: room.equipment
          .filter((eq) => !eq.deleted)
          .map((eq) => eq.name),
      };
      const response = await createRoom(payload);
  

      navigate(`/rooms/${room.id || response.data?.data?.id}`);
      toast.success("Habitación creada correctamente");
    } catch {
      setError("No se pudo crear la habitación");
    }
  };

  if (error)
    return (
      <>
        <Header title="Crear Habitación" backButton={true} />
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
        title="Crear Nueva Habitación"
        subtitle="Añadir sala al centro"
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <Form onSubmit={handleSubmit}>
                  {/* Nombre */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-olive">
                      Nombre
                    </Form.Label>
                    <Form.Control
                      name="name"
                      value={room.name}
                      onChange={handleChange}
                      placeholder="Nombre de la sala"
                      required
                    />
                  </Form.Group>

                  {/* Lugar */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-olive">
                      Lugar
                    </Form.Label>
                    <Form.Control
                      name="place"
                      value={room.place}
                      onChange={handleChange}
                      placeholder="Ubicación dentro del centro"
                      required
                    />
                  </Form.Group>

                  {/* Equipamientos */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-olive">
                      Equipamientos
                    </Form.Label>

                    <div className="d-flex gap-2 mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Nuevo equipamiento"
                        value={newEquipment}
                        onChange={(e) => setNewEquipment(e.target.value)}
                      />
                      <Button variant="success" onClick={handleAddEquipment}>
                        Añadir
                      </Button>
                    </div>

                    <ListGroup>
                      {room.equipment.map((item, index) => (
                        <ListGroup.Item
                          key={index}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <span
                            className={
                              item.deleted
                                ? "text-muted text-decoration-line-through"
                                : ""
                            }
                          >
                            {item.name}
                          </span>

                          {!item.deleted ? (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleSoftDelete(index)}
                            >
                              Eliminar
                            </Button>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleRestore(index)}
                            >
                              Restaurar
                            </Button>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Form.Group>

                  {/* Botones */}
                  <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate("/rooms")}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" variant="success">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-check-lg me-2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                      </svg>
                      Crear habitación
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
