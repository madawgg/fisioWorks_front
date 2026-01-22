import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import Select from "react-select";
import { getAppointment, updateAppointment } from "../../api/appointment.js";
import { getPatients } from "../../api/patient.js";
import { getRooms } from "../../api/room.js";
import { getTreatments } from "../../api/treatment.js";
import { getTherapists } from "../../api/therapist.js";
import { getActivePatientBonosByPatientId } from "../../api/patientBono.js";
import { capitalize } from "../../utils/strings.js";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";

// Estilos personalizados para react-select
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "48px",
    borderColor: state.isFocused ? "#8fae3d" : "#ced4da",
    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(143, 174, 61, 0.25)" : null,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#8fae3d"
      : state.isFocused
      ? "#e6edd6"
      : "white",
    color: state.isSelected ? "white" : "#1a1a1a",
  }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [patientBonos, setPatientBonos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: null,
    room_id: "",
    treatment_id: "",
    therapist_id: null,
    patient_bono_id: null,
    appointment_date: "",
    status: "pending",
    is_paid: false,
  });

  // Cargar datos al montar
  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getAppointment(id),
      getPatients(),
      getRooms(),
      getTreatments(),
      getTherapists(),
    ])
      .then(
        async ([
          appointmentData,
          patientsRes,
          roomsRes,
          treatmentsRes,
          therapistsRes,
        ]) => {
          setPatients(patientsRes.data.data || []);
          setRooms(roomsRes.data.data || []);
          setTreatments(treatmentsRes.data.data || []);
          setTherapists(therapistsRes.data.data || []);

          // Formatear la fecha para datetime-local sin desfase de zona horaria
          const dateFromBackend = appointmentData.appointment_date.replace(
            " ",
            "T"
          );
          const date = new Date(dateFromBackend);
          const tzOffset = date.getTimezoneOffset() * 60000;
          const dateStr = new Date(date.getTime() - tzOffset)
            .toISOString()
            .slice(0, 16);
          const patientId = appointmentData.patient?.id || null;

          // Cargar bonos del paciente si existe
          if (patientId) {
            try {
              const bonosRes = await getActivePatientBonosByPatientId(patientId);
              setPatientBonos(bonosRes.data.data || []);
            } catch {
              setPatientBonos([]);
            }
          }

          setFormData({
            patient_id: patientId,
            room_id: appointmentData.room?.id?.toString() || "",
            treatment_id: appointmentData.treatment?.id?.toString() || "",
            therapist_id: appointmentData.therapist?.id || null,
            patient_bono_id: appointmentData.patient_bono_id || null,
            appointment_date: dateStr,
            status: appointmentData.status || "scheduled",
            is_paid: appointmentData.is_paid || false,
          });
        }
      )
      .catch((err) => setError("Error cargando datos: " + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Recargar bonos cuando cambia el paciente seleccionado
  useEffect(() => {
    if (formData.patient_id) {
      getActivePatientBonosByPatientId(formData.patient_id)
        .then((res) => {
          setPatientBonos(res.data?.data || []);
        })
        .catch(() => {
          setPatientBonos([]);
        });
    } else {
      setPatientBonos([]);
    }
  }, [formData.patient_id]);

  // Resetear bono seleccionado cuando cambia el tratamiento
  useEffect(() => {
    if (formData.treatment_id && formData.patient_bono_id) {
      const selectedTreatment = treatments.find(
        (t) => Number(t.id) === Number(formData.treatment_id)
      );
      
      if (selectedTreatment) {
        const selectedBono = patientBonos.find(
          (b) => Number(b.id) === Number(formData.patient_bono_id)
        );
        
        // Si el bono seleccionado no coincide con la duración del tratamiento, resetear
        if (selectedBono && selectedBono.bono?.session_duration !== selectedTreatment.duration) {
          setFormData((prev) => ({ ...prev, patient_bono_id: null }));
        }
      }
    }
  }, [formData.treatment_id, formData.patient_bono_id, treatments, patientBonos]);

  // React-select opciones
  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${capitalize(p.full_name)}`,
  }));

  const therapistOptions = therapists.map((t) => ({
    value: t.id,
    label: `${capitalize(t.full_name)}`,
  }));

  // Obtener tratamiento seleccionado
  const selectedTreatment = treatments.find(
    (t) => Number(t.id) === Number(formData.treatment_id)
  );

  // Filtrar bonos que coincidan con la duración del tratamiento seleccionado
  const filteredPatientBonos = selectedTreatment
    ? patientBonos.filter((b) => {
        const bonoSessionDuration = b.bono?.session_duration;
        const treatmentDuration = selectedTreatment.duration;
        return bonoSessionDuration === treatmentDuration;
      })
    : patientBonos;

  const bonoOptions = [
    { value: null, label: "Sin bono" },
    ...filteredPatientBonos.map((b) => ({
      value: b.id,
      label: `${b.bono?.name || "Bono"} - ${
        b.sessions_remaining
      } sesiones restantes`,
    })),
  ];

  const statusOptions = [
    { value: "scheduled", label: "Programada" },
    { value: "completed", label: "Completada" },
    { value: "cancelled", label: "Cancelada" },
    { value: "pending", label: "Pendiente" },
  ];

  // Calcular hora fin
  const endTime = (() => {
    if (!formData.appointment_date || !selectedTreatment?.duration) return null;
    const start = new Date(formData.appointment_date);
    const end = new Date(start.getTime() + selectedTreatment.duration * 60000);
    return end.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

  // Obtener fecha/hora mínima (ahora)
  const getMinDateTime = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validar que la fecha no sea en el pasado
      const selectedDate = new Date(formData.appointment_date);
      const now = new Date();
      if (selectedDate < now) {
        setError("No se pueden agendar citas en el pasado");
        setSaving(false);
        return;
      }

      // Convertir fecha a formato MySQL respetando hora local (evitar desfase a UTC)
      const dateObj = new Date(formData.appointment_date);
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const formattedDate = new Date(dateObj.getTime() - tzOffset)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const appointmentData = {
        patient_id: formData.patient_id,
        therapist_id: formData.therapist_id,
        room_id: Number(formData.room_id),
        treatment_id: Number(formData.treatment_id),
        appointment_date: formattedDate,
        patient_bono_id: formData.patient_bono_id || null,
        status: formData.status,
        is_paid: formData.is_paid,
      };

      await updateAppointment(id, appointmentData);
      setSuccess(true);

      setTimeout(() => {
        navigate("/agenda");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar la cita");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid =
    formData.patient_id &&
    formData.room_id &&
    formData.treatment_id &&
    formData.therapist_id &&
    formData.appointment_date;

  if (loading)
    return (
      <>
        <Header title="Editar Cita" backButton={true} />
        <DetailLayout loading={loading} />
      </>
    );

  if (error && !formData.patient_id)
    return (
      <>
        <Header title="Editar Cita" backButton={true} />
        <DetailLayout error={error} />
      </>
    );

  return (
    <>
      <Header
        title="Editar Cita"
        subtitle="Modificar información de la cita"
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                {error && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success">
                    <i className="bi bi-check-circle me-2" />
                    ¡Cita actualizada exitosamente!
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Fecha / Fin */}
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label className="text-success fw-semibold">
                          Fecha y hora de inicio
                        </Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="appointment_date"
                          value={formData.appointment_date}
                          onChange={handleChange}
                          min={getMinDateTime()}
                          required
                        />
                        <Form.Text className="text-muted">
                          No se pueden agendar citas en el pasado
                        </Form.Text>
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label className="text-success fw-semibold">
                          Duración / Fin
                        </Form.Label>
                        <div className="form-control bg-light">
                          {selectedTreatment ? (
                            <>
                              {selectedTreatment.duration} min
                              {endTime && (
                                <span className="badge bg-success ms-3">
                                  Fin: {endTime}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted">
                              Selecciona un tratamiento
                            </span>
                          )}
                        </div>
                      </Form.Group>
                    </div>
                  </div>

                  {/* Paciente */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-success fw-semibold">
                      Paciente
                    </Form.Label>
                    <Select
                      options={patientOptions}
                      value={patientOptions.find(
                        (o) => o.value === formData.patient_id
                      )}
                      onChange={(o) =>
                        setFormData((p) => ({
                          ...p,
                          patient_id: o ? o.value : null,
                          patient_bono_id: null,
                        }))
                      }
                      placeholder="Buscar paciente..."
                      isClearable
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  </Form.Group>

                  {/* Terapeuta */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-success fw-semibold">
                      Terapeuta
                    </Form.Label>
                    <Select
                      options={therapistOptions}
                      value={therapistOptions.find(
                        (o) => o.value === formData.therapist_id
                      )}
                      onChange={(o) =>
                        setFormData((p) => ({
                          ...p,
                          therapist_id: o ? o.value : null,
                        }))
                      }
                      placeholder="Buscar terapeuta..."
                      isClearable
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  </Form.Group>

                  {/* Tratamiento */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-success fw-semibold">
                      Tratamiento
                    </Form.Label>
                    <Form.Select
                      name="treatment_id"
                      value={formData.treatment_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar tratamiento...</option>
                      {treatments.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} — {t.duration} min — {t.price}€
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Sala */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-success fw-semibold">
                      Sala
                    </Form.Label>
                    <Form.Select
                      name="room_id"
                      value={formData.room_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar sala...</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Estado */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-success fw-semibold">
                      Estado
                    </Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Pagado */}
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="is_paid"
                      name="is_paid"
                      label="Pagado"
                      checked={formData.is_paid}
                      onChange={handleChange}
                      className="text-success fw-semibold"
                    />
                  </Form.Group>

                  {/* Bono opcional */}
                  <Form.Group className="mb-4">
                    <Form.Label className="text-success fw-semibold">
                      Bono (opcional)
                    </Form.Label>
                    <Select
                      options={bonoOptions}
                      value={bonoOptions.find(
                        (o) => {
                          // Manejar el caso de "Sin bono" (value: null)
                          if (o.value === null && formData.patient_bono_id === null) {
                            return true;
                          }
                          // Comparar IDs numéricos
                          return Number(o.value) === Number(formData.patient_bono_id);
                        }
                      )}
                      onChange={(o) =>
                        setFormData((p) => ({
                          ...p,
                          patient_bono_id: o ? o.value : null,
                        }))
                      }
                      placeholder="Seleccionar bono..."
                      isClearable
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                    
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => navigate("/agenda")}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success px-4"
                      disabled={!isFormValid || saving}
                    >
                      <i className="bi bi-check-lg me-2"></i>
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
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
