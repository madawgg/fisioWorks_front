import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMedicalHistory, updateMedicalHistory } from "../../api/medicalHistory.js";
import { getTherapists } from "../../api/therapist.js";
import { useAuth } from "../../hooks/useAuth.js";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";
import { toast } from "react-toastify";
import { Form, Button, Spinner } from "react-bootstrap";

export default function EditMedicalHistory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const isAdmin = currentUser?.roles?.includes("admin");
  const isTherapist = currentUser?.roles?.includes("therapist");
  const canEdit = isAdmin || isTherapist;

  // Estado del formulario
  const [formData, setFormData] = useState({
    therapist_id: "",
    patient_id: "",
    note: ""
  });
  const [therapists, setTherapists] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        // Cargar historial médico
        const historyData = await getMedicalHistory(id);
        setMedicalHistory(historyData);
        
        // Establecer datos del formulario
        setFormData({
          therapist_id: historyData.therapist?.id || "",
          patient_id: historyData.patient?.id || "",
          note: historyData.note || ""
        });
        
        // Si es admin, cargar lista de terapeutas
        if (isAdmin) {
          const therapistsRes = await getTherapists();
          const therapistsList = therapistsRes.data?.data || therapistsRes.data || [];
          setTherapists(therapistsList);
        }
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    if (canEdit) {
      loadData();
    }
  }, [id, isAdmin, canEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.therapist_id) {
      toast.error("Debes seleccionar un terapeuta");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        therapist_id: parseInt(formData.therapist_id, 10),
        patient_id: parseInt(formData.patient_id, 10),
        note: formData.note
      };
      await updateMedicalHistory(id, payload);
      toast.success("Historial médico actualizado correctamente");
      navigate(`/medical-histories/${id}`);
    } catch (err) {
      toast.error("Error al actualizar el historial médico: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/medical-histories/${id}`);
  };

  // No tiene permisos
  if (!canEdit) {
    return (
      <>
        <Header
          title="Acceso Denegado"
          backButton={true}
        />
        <DetailLayout error="Solo los administradores y terapeutas pueden editar historiales médicos." />
      </>
    );
  }

  if (loadingData) {
    return (
      <>
        <Header
          title="Editar Historial Médico"
          backButton={true}
        />
        <DetailLayout loading={loadingData} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          title="Editar Historial Médico"
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );
  }

  if (!medicalHistory) {
    return (
      <>
        <Header
          title="Editar Historial Médico"
          backButton={true}
        />
        <div className="container py-5">
          <div className="alert alert-warning" role="alert">
            No se encontró el historial médico.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Editar Historial Médico"
        subtitle={
          medicalHistory.patient?.full_name
            ? `Paciente: ${medicalHistory.patient.full_name}`
            : "Editar historial médico"
        }
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <Form onSubmit={handleSubmit}>
                  {/* Paciente (solo lectura) */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-olive">
                      Paciente
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={medicalHistory.patient?.full_name || "—"}
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>

                  {/* Terapeuta */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-olive">
                      Terapeuta
                    </Form.Label>
                    {isTherapist ? (
                      // Si es terapeuta, mostrar su nombre (no editable)
                      <Form.Control
                        type="text"
                        value={`${currentUser.name} ${currentUser.surname}`}
                        disabled
                        className="bg-light"
                      />
                    ) : (
                      // Si es admin, mostrar select
                      <Form.Select
                        name="therapist_id"
                        value={formData.therapist_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un terapeuta...</option>
                        {therapists.map((therapist) => (
                          <option key={therapist.id} value={therapist.id}>
                            {therapist.full_name || `${therapist.user?.name || ''} ${therapist.user?.surname || ''}`}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Form.Group>

                  {/* Nota */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-olive">
                      Nota
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder="Escribe aquí las observaciones del historial médico..."
                      required
                    />
                  </Form.Group>

                  {/* Botones */}
                  <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      variant="success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
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
                          Guardar Cambios
                        </>
                      )}
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

