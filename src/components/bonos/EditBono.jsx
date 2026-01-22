import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBono, updateBono, createBono } from "../../api/bono.js";
import { Button, Form, Spinner } from "react-bootstrap";
import Header from "../layouts/Header.jsx";
import { toast } from "react-toastify";

export default function EditBono() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewBono = !id || id === "new";

  const [bono, setBono] = useState({ 
    name: "", 
    description: "", 
    sessions: 1,
    session_duration: "",
    price: "",
    validity_days: "",
    active: null
  });
  const [loading, setLoading] = useState(!isNewBono);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isNewBono) {
      async function loadBono() {
        try {
          const data = await getBono(id);
          setBono(data);
        } catch {
          setError("No se pudo cargar el bono");
        } finally {
          setLoading(false);
        }
      }
      loadBono();
    }
  }, [id, isNewBono]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBono((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!bono.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    
    if (bono.sessions < 1) {
      setError("Las sesiones deben ser al menos 1");
      return;
    }

    try {
      const payload = {
        name: bono.name.trim(),
        description: bono.description?.trim() || "",
        sessions: parseInt(bono.sessions),
        session_duration: bono.session_duration ? parseInt(bono.session_duration) : null,
        price: bono.price ? parseFloat(bono.price) : null,
        validity_days: bono.validity_days ? parseInt(bono.validity_days) : null,
        active: bono.active || false
      };

      if (isNewBono) {
        const response = await createBono(payload);
        const newBonoId = response.data?.data?.id || response.data?.id;
        navigate(`/bonos/${newBonoId}`);
        toast.success("Bono creado correctamente");
      } else {
        await updateBono(id, payload);
        navigate(`/bonos/${id}`);
        toast.success("Bono actualizado correctamente");
      }
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo guardar el bono");
    }
  };

  if (loading) {
    return (
      <>
        <Header 
          title={isNewBono ? "Crear Bono" : "Editar Bono"}
          backButton={true}
        />
        <div className="d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}>
          <Spinner animation="border" className="text-olive" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={isNewBono ? "Crear Bono" : `Editar: ${bono.name}`}
        subtitle={
          isNewBono ? "Nuevo bono o paquete" : `${bono.sessions} sesiones`
        }
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className="alert alert-danger mb-4" role="alert">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Nombre */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-olive">
                      Nombre <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      name="name"
                      value={bono.name}
                      onChange={handleChange}
                      placeholder="Ej: Bono 10 sesiones"
                      required
                    />
                  </Form.Group>

                  {/* Descripción */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-olive">
                      Descripción
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      rows={4}
                      value={bono.description}
                      onChange={handleChange}
                      placeholder="Descripción del bono..."
                    />
                  </Form.Group>

                  {/* Sesiones */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-olive">
                      Número de Sesiones <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="sessions"
                      min="1"
                      value={bono.sessions}
                      onChange={handleChange}
                      placeholder="Número de sesiones incluidas"
                      required
                    />
                  </Form.Group>

                  {/* Duración de sesión */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-olive">
                      Duración de 1 sesión{" "}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="session_duration"
                      min="1"
                      value={bono.session_duration}
                      onChange={handleChange}
                      placeholder="Duración de 1 sesión en minutos"
                      required
                    />
                  </Form.Group>

                  {/* Precio */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-olive">
                      Precio (€)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="price"
                      value={bono.price}
                      onChange={handleChange}
                      placeholder="Precio del bono"
                    />
                    <Form.Text className="text-muted">
                      Deja en blanco si no quieres especificar precio
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-olive">
                      Estado
                    </Form.Label>
                    <Form.Check 
                      type="checkbox"
                      id="active"
                      name="active"
                      checked={bono.active}
                      onChange={handleChange}
                      label="Activo"
                      className="text-success fw-semibold"
                    />
                  </Form.Group>

                  {/* Botones */}
                  <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    <Button
                      variant="outline-secondary"
                      onClick={() =>
                        navigate(isNewBono ? "/bonos" : `/bonos/${id}`)
                      }
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
                      {isNewBono ? "Crear Bono" : "Guardar Cambios"}
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

