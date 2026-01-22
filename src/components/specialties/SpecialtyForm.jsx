import { useState, useEffect } from "react";
import { Button, Form, ListGroup } from "react-bootstrap";

export default function SpecialtyForm({ 
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Guardar"
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    details: []
  });
  const [newDetail, setNewDetail] = useState("");

  // Solo se ejecuta cuando cambia el ID de initialData (evita bucle infinito)
  useEffect(() => {
    if (initialData) {
      const details = initialData.details?.map((d) =>
        typeof d === "string" ? { text: d, deleted: false } : d
      ) || [];
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        details
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDetail = () => {
    if (!newDetail.trim()) return;
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { text: newDetail.trim(), deleted: false }]
    }));
    setNewDetail("");
  };

  const handleSoftDelete = (index) => {
    const updated = [...formData.details];
    updated[index].deleted = true;
    setFormData({ ...formData, details: updated });
  };

  const handleRestore = (index) => {
    const updated = [...formData.details];
    updated[index].deleted = false;
    setFormData({ ...formData, details: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      details: formData.details
        .filter((d) => !d.deleted)
        .map((d) => d.text)
    };
    onSubmit(payload);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Nombre */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold text-olive">Nombre</Form.Label>
        <Form.Control
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre de la especialidad"
          required
        />
      </Form.Group>

      {/* Descripción */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold text-olive">Descripción</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción de la especialidad"
        />
      </Form.Group>

      {/* Detalles */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold text-olive">Detalles</Form.Label>

        <div className="d-flex gap-2 mb-3">
          <Form.Control
            type="text"
            placeholder="Nuevo detalle"
            value={newDetail}
            onChange={(e) => setNewDetail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddDetail();
              }
            }}
          />
          <Button variant="success" onClick={handleAddDetail}>
            Añadir
          </Button>
        </div>

        <ListGroup>
          {formData.details.map((item, index) => (
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
                {item.text}
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
        <Button variant="outline-secondary" onClick={onCancel}>
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
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}

