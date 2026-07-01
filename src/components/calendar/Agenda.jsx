import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "./Calendar.jsx";
import AppointmentModal from "./AppointmentModal.jsx";
import { getAppointments, getAppointment } from "../../api/appointment.js";
import { getSelfAppointments, getSelfAppointment } from "../../api/patient.js";
import { getTherapists } from "../../api/therapist.js";
import { capitalize } from "../../utils/strings.js";
import Header from "../layouts/Header.jsx";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth.js";

// Colores para cada estado
const statusColors = {
  scheduled: "#3788d8",   // Azul
  completed: "#28a745",   // Verde
  cancelled: "#dc3545",   // Rojo
  pending: "#ffc107",     // Amarillo
};

export default function Agenda() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isTherapist = user?.roles?.includes("therapist");
  const isAdmin = user?.roles?.includes("admin");
  const isPatient = user?.roles?.includes("patient");
  const isOnlyPatient = isPatient && user?.roles?.length === 1;
  const canEdit = isTherapist || isAdmin;
  const canFilterByTherapist = isTherapist || isAdmin;
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // Filtro de estado
  const [therapistFilter, setTherapistFilter] = useState("all"); // Filtro de terapeuta
  const [therapists, setTherapists] = useState([]); // Lista de terapeutas
  
  // Estado para el modal de crear cita
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  
  // Tratamiento pre-seleccionado desde navegación (ej: desde Treatment)
  const preSelectedTreatment = location.state?.treatment || null;
  const forPatient = location.state?.forPatient || false;
  const fetchAppointments = useCallback(() => {
    setLoading(true);
    const fetcher = isOnlyPatient ? getSelfAppointments : getAppointments;
    
    fetcher()
      .then((res) => {
        const raw = res.data?.data || res.data || [];
        const formatted = raw.map((a) => {
          const startDate = new Date(a.appointment_date.replace(" ", "T"));
          const duration = a.treatment?.duration || 60; // Duración en minutos, por defecto 60
          const endDate = new Date(startDate.getTime() + duration * 60000);
          
          // Formatear las horas para mostrar en el título
          const startTime = startDate.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const endTime = endDate.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });
          
          return {
            id: a.id,
            title: isOnlyPatient
              ? `${startTime} - ${endTime}\n${a.treatment?.name || "Tratamiento"}`
              : `${startTime} - ${endTime}\nPaciente ${capitalize(a.patient.name)} - Sala ${a.room.name}`,
            start: a.appointment_date.replace(" ", "T"),
            end: endDate.toISOString(),
            status: a.status || "scheduled",
            therapistId: a.therapist?.id || null,
            backgroundColor: statusColors[a.status] || statusColors.scheduled,
            borderColor: statusColors[a.status] || statusColors.scheduled,
          };
        });
        setAppointments(formatted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isOnlyPatient]);
 
  // Filtrar citas según el estado y terapeuta seleccionados
  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesTherapist = therapistFilter === "all" || a.therapistId === parseInt(therapistFilter);
    return matchesStatus && matchesTherapist;
  });

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Cargar terapeutas si el usuario puede filtrar por terapeuta
  useEffect(() => {
    if (canFilterByTherapist) {
      getTherapists()
        .then((res) => setTherapists(res.data?.data || []))
        .catch((err) => console.error("Error cargando terapeutas:", err.response?.data || err.message));
    }
  }, [canFilterByTherapist]);

  // Manejar click en un slot del calendario (hora específica en vista de día)
  const handleSlotClick = (dateTimeStr) => {
    setSelectedDateTime(dateTimeStr);
    setShowCreateModal(true);
  };

  // Callback cuando se crea una cita exitosamente
  const handleAppointmentCreated = () => {
    fetchAppointments();
  };

  function handleEventClick(info) {
    const id = info.event.id;
    const fetcher = isOnlyPatient ? getSelfAppointment : getAppointment;
    
    fetcher(id)
      .then((res) => {
        // getSelfAppointment devuelve res.data.data, 
        // getAppointment devuelve res directamente
        const appointment = isOnlyPatient ? res.data?.data : res;
        setSelectedAppointment(appointment);
      })
      .catch((err) => console.error(err.response?.data || err.message));
  }
  
  if (loading)
    return (
      <>
        <Header 
          title="Agenda" 
          subtitle="Calendario de citas"
        />
        <div className="d-flex justify-content-center align-items-center" style={{ marginTop: "45vh" }}>
          <Spinner animation="border" className="text-olive" />
        </div>
      </>
    );

  if (error) 
    return (
      <>
        <Header 
          title="Agenda" 
          subtitle="Calendario de citas"
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
      title="Agenda" 
      subtitle={`${filteredAppointments.length} cita${filteredAppointments.length !== 1 ? 's' : ''} ${statusFilter === "all" ? "en total" : "filtrada" + (filteredAppointments.length !== 1 ? 's' : '')}`}
    />
    <div className="container-fluid px-4 py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11 col-xl-10">
          <Calendar
            events={filteredAppointments}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            therapistFilter={therapistFilter}
            onTherapistFilterChange={setTherapistFilter}
            therapists={therapists}
            canFilterByTherapist={canFilterByTherapist}
          />
        </div>
      </div>
    </div>

    {selectedAppointment && (
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={() => setSelectedAppointment(null)}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content p-4">
            <h5 className="text-olive text-center mb-3">Cita</h5>
            <p>
              <strong>Fecha y hora:</strong>{" "}
              {selectedAppointment.appointment_date}
            </p>
            {!isOnlyPatient && (
              <>
                <p>
                  <strong>Sala:</strong> {selectedAppointment.room?.name}
                </p>
                <p>
                  <strong>Paciente:</strong>{" "}
                  {capitalize(selectedAppointment.patient?.full_name)}
                </p>
              </>
            )}
            <p>
              <strong>Tratamiento:</strong> {selectedAppointment.treatment?.name}
            </p>
            <p>
              <strong>PVP:</strong> {selectedAppointment.treatment?.price}€
            </p>
            <p>
              <strong>Descripción: </strong>
              {selectedAppointment.treatment?.description}
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  setSelectedAppointment(null);
                  navigate(`/agenda/${selectedAppointment.id}`);
                }}
              >
                <i className="bi bi-eye me-1"></i>
                Ver detalles
              </button>
              {canEdit && (
                <button
                  className="btn btn-outline-dark "
                  onClick={() => navigate(`/appointments/${selectedAppointment.id}/edit`)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Editar
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedAppointment(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Modal para crear nueva cita */}
    <AppointmentModal
      show={showCreateModal}
      onHide={() => setShowCreateModal(false)}
      selectedDateTime={selectedDateTime}
      onAppointmentCreated={handleAppointmentCreated}
      isOnlyPatient={isOnlyPatient}
      preSelectedTreatment={preSelectedTreatment}
      forPatient={forPatient}
    />
  </>
);

}
