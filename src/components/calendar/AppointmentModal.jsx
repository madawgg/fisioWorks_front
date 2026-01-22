import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import Select from "react-select";
import { getPatients } from "../../api/patient.js";
import { getRooms, getEmptyRooms } from "../../api/room.js";
import { getTreatments } from "../../api/treatment.js";
import { getTherapists, getFreeTherapists } from "../../api/therapist.js";
import { getActivePatientBonosByPatientId } from "../../api/patientBono.js";
import { createAppointment, purchaseAppointment } from "../../api/appointment.js";
import { capitalize } from "../../utils/strings.js";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth.js";
import PaymentModal from "../common/PaymentModal.jsx";


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

export default function AppointmentModal({
  show,
  onHide,
  selectedDateTime,
  onAppointmentCreated,
  preSelectedTreatment = null,
  forPatient = false,
}) {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [treatments, setTreatments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [availableTherapists, setAvailableTherapists] = useState([]);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [patientBonos, setPatientBonos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { state } = useLocation();
  
  // Usar tratamiento de props o del state de navegación
  const treatment_id = preSelectedTreatment?.id || state?.treatment_id;
  const treatment = preSelectedTreatment || state?.treatment;
  const isPatient = user?.roles?.includes("patient");
  const isOnlyPatient = isPatient && user?.roles?.length === 1;
  // Si viene con forPatient=true, actuar como admin/therapist (no auto-seleccionar paciente)
  const isForPatientMode = forPatient || state?.forPatient;
  const patient_id = isOnlyPatient ? user?.patient?.id : null;
  
  const [formData, setFormData] = useState({
    patient_id: patient_id,
    room_id: treatment?.room_id || "",
    treatment_id: treatment_id || "",
    therapist_id: treatment?.therapist_id || null,
    patient_bono_id: treatment?.patient_bono_id || null,
    appointment_date: "",
    duration: treatment?.duration || null,
  });

  // Cargar datos al abrir modal
  useEffect(() => {
    if (show) {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Si es paciente y NO está en modo "cita para paciente", auto-seleccionar su ID
      if (isPatient && !isForPatientMode) {
        setFormData((prev) => ({ 
          ...prev, 
          patient_id: user.patient?.id,
          room_id: "", 
          treatment_id: treatment_id || "", 
          therapist_id: null, 
          patient_bono_id: treatment?.patient_bono_id || null,
        }));
      }
      // Para admin/therapist: no resetear patient_id aquí, solo limpiar otros campos si es necesario

      // Si es solo paciente (y no está en modo forPatient), cargar tratamientos y bonos
      if (isOnlyPatient) {
        Promise.all([
          getTreatments(),  
          getActivePatientBonosByPatientId(patient_id),
        ])
          .then(([treatmentsRes, bonosRes]) => {
            setTreatments(treatmentsRes.data.data || []);
            setPatientBonos(bonosRes.data.data || []);
          })
          .catch((err) => setError("Error cargando datos: " + err.message))
          .finally(() => setLoading(false));
      } else {
        // Cargar todos los datos para admin/therapist o modo "cita para paciente"
        Promise.all([
          getPatients(),
          getRooms(),
          getTreatments(),
          getTherapists(),
          getActivePatientBonosByPatientId(patient_id),
        ])
          .then(
            ([patientsRes, roomsRes, treatmentsRes, therapistsRes, bonosRes]) => {
              setPatients(patientsRes.data.data || []);
              setRooms(roomsRes.data.data || []);
              setTreatments(treatmentsRes.data.data || []);
              setTherapists(therapistsRes.data.data || []);
              setPatientBonos(bonosRes.data.data || []);
            }
          )
          .catch((err) => setError("Error cargando datos: " + err.message))
          .finally(() => setLoading(false));
      }
    }
  }, [show, isOnlyPatient, isForPatientMode, treatment_id, patient_id, treatment?.patient_bono_id, user?.roles, isPatient, user?.patient?.id]);

  // Recargar bonos cuando cambia el paciente seleccionado
  useEffect(() => {
    if (formData.patient_id) {
      getActivePatientBonosByPatientId(formData.patient_id)
        .then((res) => {
          setPatientBonos(res.data.data || []);
        })
        .catch(() => {
          setPatientBonos([]);
        });
    } else {
      setPatientBonos([]);
    }
  }, [formData.patient_id]);

  // Cargar salas y terapeutas disponibles cuando cambian fecha/hora y tratamiento
  useEffect(() => {
    // Solo cargar disponibilidad si hay fecha y tratamiento seleccionado
    if (formData.appointment_date && formData.treatment_id && !isOnlyPatient) {
      const selectedTreatment = treatments.find(
        (t) => Number(t.id) === Number(formData.treatment_id)
      );
      
      if (selectedTreatment?.duration) {
        // Convertir la fecha del input a formato MySQL para el backend
        const dateObj = new Date(formData.appointment_date);
        const tzOffset = dateObj.getTimezoneOffset() * 60000;
        const datetime = new Date(dateObj.getTime() - tzOffset)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        
        // Cargar salas disponibles
        setLoadingRooms(true);
        getEmptyRooms(datetime, selectedTreatment.duration)
          .then((res) => {
            setAvailableRooms(res.data?.data || []);
          })
          .catch(() => {
            setAvailableRooms(rooms);
          })
          .finally(() => setLoadingRooms(false));

        // Cargar terapeutas disponibles
        setLoadingTherapists(true);
        getFreeTherapists(datetime, selectedTreatment.duration)
          .then((res) => {
            setAvailableTherapists(res.data?.data || []);
          })
          .catch(() => {
            setAvailableTherapists(therapists);
          })
          .finally(() => setLoadingTherapists(false));
      }
    } else {
      // Si no hay fecha o tratamiento, mostrar todos
      setAvailableRooms(rooms);
      setAvailableTherapists(therapists);
    }
  }, [formData.appointment_date, formData.treatment_id, treatments, rooms, therapists, isOnlyPatient]);

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

  // Normaliza una fecha a formato datetime-local sin desfase de zona horaria
  const toLocalInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Set fecha desde el calendario
  useEffect(() => {
    if (selectedDateTime) {
      const formatted = toLocalInputValue(selectedDateTime);
      setFormData((prev) => ({ ...prev, appointment_date: formatted }));
    }
  }, [selectedDateTime]);

  // Obtener fecha/hora mínima (ahora)
  const getMinDateTime = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // React-select opciones
  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${capitalize(p.full_name)}`,
  }));

  const therapistOptions = availableTherapists.map((t) => ({
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
      label: `${b.bono?.name || 'Bono'} - ${b.sessions_remaining} sesiones restantes`,
    })),
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

  // Handlers
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(formData.appointment_date);
    const now = new Date();
    if (selectedDate < now) {
      setError("No se pueden agendar citas en el pasado");
      return;
    }

    // Si es paciente reservando para sí mismo, mostrar modal de pago
    if (isOnlyPatient && !isForPatientMode) {
      setShowPaymentModal(true);
    } else {
      // Admin/therapist: crear directamente sin pago
      await processAppointmentCreation();
    }
  };

  const processAppointmentCreation = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Convertir fecha a MySQL respetando hora local (evitar desfase a UTC)
      const dateObj = new Date(formData.appointment_date);
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const formattedDate = new Date(dateObj.getTime() - tzOffset)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // Si es solo paciente (y no está en modo forPatient), usar purchaseAppointment
      if (isOnlyPatient && !isForPatientMode) {
        const purchaseData = {
          treatment_id: Number(formData.treatment_id),
          appointment_date: formattedDate,
          patient_bono_id: formData.patient_bono_id || null,
        };
        await purchaseAppointment(purchaseData);
      } else {
        // Para admin/therapist o modo "cita para paciente", usar createAppointment
        const appointmentData = {
          patient_id: formData.patient_id,
          therapist_id: formData.therapist_id,
          room_id: Number(formData.room_id),
          treatment_id: Number(formData.treatment_id),
          appointment_date: formattedDate,
          patient_bono_id: formData.patient_bono_id || null,
          status: "scheduled",
          is_paid: false,
        };
        await createAppointment(appointmentData);
      }

      setSuccess(true);

      setTimeout(() => {
        onAppointmentCreated?.();
        handleClose();
        toast.success("Cita creada exitosamente");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear la cita");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patient_id: null,
      room_id: "",
      treatment_id: "",
      therapist_id: null,
      patient_bono_id: null,
      appointment_date: "",
    });
    setError(null);
    setSuccess(false);
    setShowPaymentModal(false);
    onHide();
  };

  const isFormValid =
    formData.patient_id &&
    formData.treatment_id &&
    formData.appointment_date &&
    (!isOnlyPatient ? availableTherapists.length > 0 : true);

  // Calcular el precio a mostrar en el modal de pago
  const getAppointmentPrice = () => {
    if (!selectedTreatment) return "0.00";
    // Si usa un bono, el precio es 0
    if (formData.patient_bono_id) return "0.00";
    return parseFloat(selectedTreatment.price).toFixed(2);
  };
  
  return (
    <>
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      size="nm"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-olive fw-bold">
          <i className="bi bi-calendar-plus me-2"></i>Nueva Cita
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-2">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
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
                ¡Cita creada exitosamente!
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Fecha / Fin */}
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha y hora de inicio</Form.Label>
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
                    <Form.Label>Duración / Fin</Form.Label>
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
              {(!user.roles.includes("patient") || isForPatientMode) && (
              <Form.Group className="mb-3">
                <Form.Label>Paciente</Form.Label>
                <Select
                  options={patientOptions}
                  value={patientOptions.find(
                    (o) => o.value === formData.patient_id
                  ) || null}
                  onChange={(o) =>
                    setFormData((p) => ({
                      ...p,
                      patient_id: o ? o.value : null,
                    }))
                  }
                  placeholder="Buscar paciente..."
                  isClearable
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                />
              </Form.Group>
              )}
              {/* Terapeuta */}
              {(!user.roles.includes("patient") || isForPatientMode) && (
              <Form.Group className="mb-3">
                <Form.Label>
                  Terapeuta
                  {loadingTherapists && (
                    <Spinner animation="border" size="sm" className="ms-2" />
                  )}
                </Form.Label>
                <Select
                  options={therapistOptions}
                  value={therapistOptions.find(
                    (o) => o.value === formData.therapist_id
                  ) || null}
                  onChange={(o) =>
                    setFormData((p) => ({
                      ...p,
                      therapist_id: o ? o.value : null,
                    }))
                  }
                  placeholder={
                    loadingTherapists 
                      ? "Buscando terapeutas disponibles..." 
                      : availableTherapists.length === 0 
                        ? "No hay terapeutas disponibles"
                        : "Buscar terapeuta..."
                  }
                  isClearable
                  isDisabled={loadingTherapists}
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  noOptionsMessage={() => "No hay terapeutas disponibles"}
                />
                {!loadingTherapists && availableTherapists.length === 0 && formData.appointment_date && formData.treatment_id && (
                  <Form.Text className="text-danger">
                    No hay terapeutas disponibles para esta fecha y hora. No se puede agendar la cita.
                  </Form.Text>
                )}
              </Form.Group>
              )}
              {/* Tratamiento */}
              
              <Form.Group className="mb-3">
                <Form.Label>Tratamiento</Form.Label>
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
              {(!user.roles.includes("patient") || isForPatientMode) && (
              <Form.Group className="mb-3">
                <Form.Label>
                  Sala
                  {loadingRooms && (
                    <Spinner animation="border" size="sm" className="ms-2" />
                  )}
                </Form.Label>
                <Form.Select
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleChange}
                  required
                  disabled={loadingRooms}
                >
                  <option value="">
                    {loadingRooms 
                      ? "Buscando salas disponibles..." 
                      : availableRooms.length === 0 
                        ? "No hay salas disponibles"
                        : "Seleccionar sala..."}
                  </option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </Form.Select>
                {!loadingRooms && availableRooms.length === 0 && formData.appointment_date && formData.treatment_id && (
                  <Form.Text className="text-danger">
                    No hay salas disponibles para esta fecha y hora
                  </Form.Text>
                )}
              </Form.Group>
              )}
              {/* Bono opcional */}
              <Form.Group className="mb-4">
                <Form.Label>Bono (opcional)</Form.Label>
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

              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-secondary" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  type="submit"
                  disabled={!isFormValid || submitting}
                >
                  {submitting ? "Guardando..." : "Crear Cita"}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal.Body>

      {/* Modal de pago para pacientes */}
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        onConfirmPayment={processAppointmentCreation}
        amount={getAppointmentPrice()}
        itemName={selectedTreatment ? `Cita: ${selectedTreatment.name} (${selectedTreatment.duration} min)` : "Cita"}
      />
    </Modal>
    </>
  );
}
