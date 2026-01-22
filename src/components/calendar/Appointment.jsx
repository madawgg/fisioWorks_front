import { useParams, useNavigate } from "react-router-dom";
import { getAppointment } from "../../api/appointment.js";
import { getSelfAppointment } from "../../api/patient.js";
import { useState, useEffect } from "react";
import { Badge, Card, Row, Col } from "react-bootstrap";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { capitalize } from "../../utils/strings.js";

// Colores y etiquetas para estados
const statusConfig = {
  scheduled: { label: "Programada", bg: "primary" },
  completed: { label: "Completada", bg: "success" },
  cancelled: { label: "Cancelada", bg: "danger" },
  pending: { label: "Pendiente", bg: "warning" },
};

export default function Appointment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const isTherapist = user?.roles?.includes("therapist");
  const isAdmin = user?.roles?.includes("admin");
  const isOnlyPatient = user?.roles?.includes("patient") && user?.roles?.length === 1;
  const canEdit = isTherapist || isAdmin;

  useEffect(() => {
    const fetcher = isOnlyPatient ? getSelfAppointment : getAppointment;
    
    fetcher(id)
      .then((res) => {
        const data = isOnlyPatient ? res.data?.data : res;
        setAppointment(data);
      })
      .catch((err) => setError(err.message || "Error al cargar la cita"))
      .finally(() => setLoading(false));
  }, [id, isOnlyPatient]);

  const handleEdit = () => navigate(`/appointments/${id}/edit`);

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calcular hora fin
  const getEndTime = () => {
    if (!appointment?.appointment_date || !appointment?.treatment?.duration) return null;
    const start = new Date(appointment.appointment_date);
    const end = new Date(start.getTime() + appointment.treatment.duration * 60000);
    return end.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  if (loading)
    return (
      <>
        <Header 
          title="Detalles de Cita" 
          backButton={true}
        />
        <DetailLayout loading={loading} />
      </>
    );

  if (error) 
    return (
      <>
        <Header 
          title="Detalles de Cita" 
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );

  if (!appointment)
    return (
      <>
        <Header 
          title="Detalles de Cita" 
          backButton={true}
        />
        <DetailLayout error="No se encontró la cita" />
      </>
    );

  const status = statusConfig[appointment.status] || { label: appointment.status, bg: "secondary" };

  return (
    <>
      <Header
        title="Detalles de Cita"
        subtitle={capitalize(formatDate(appointment.appointment_date))}
        backButton={true}
      />

      <div className="container-fluid px-4 py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={8}>
            
            {/* Botón editar - solo para admin/therapist */}
            {canEdit && (
              <div className="mb-3">
                <button
                  className="btn btn-outline-dark"
                  onClick={handleEdit}
                >
                  Editar Cita
                </button>
              </div>
            )}

            {/* Card principal */}
            <Card className="shadow-sm border-0">
              <Card.Body className="p-0">
                
                {/* Header: Estado y Pago */}
                <div className="bg-light px-4 py-3 border-bottom">
                  <div className="d-flex flex-wrap gap-2">
                    <Badge bg={status.bg} className="px-3 py-2">
                      {status.label}
                    </Badge>
                    <Badge bg={appointment.is_paid ? "success" : "warning"} text={appointment.is_paid ? "light" : "dark"} className="px-3 py-2">
                      {appointment.is_paid ? "Pagada" : "Pendiente de pago"}
                    </Badge>
                    {appointment.patient_bono_id && (
                      <Badge bg="info" className="px-3 py-2">
                        <i className="bi bi-ticket-perforated me-1"></i>
                        Con bono
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  {/* Fecha y Hora */}
                  <div className="mb-4 pb-4 border-bottom">
                    <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "600" }}>
                      Fecha y Hora
                    </h6>
                    <div className="fs-4 fw-bold text-dark mb-1">
                      {formatTime(appointment.appointment_date)}
                      {getEndTime() && (
                        <span className="text-muted fw-normal"> — {getEndTime()}</span>
                      )}
                    </div>
                    {appointment.treatment?.duration && (
                      <span className="badge bg-secondary">
                        {appointment.treatment.duration} minutos
                      </span>
                    )}
                  </div>

                  <Row className="g-4">
                    {/* Tratamiento */}
                    <Col md={6}>
                      <div>
                        <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "600" }}>
                          Tratamiento
                        </h6>
                        <div 
                          className={`fs-5 fw-semibold mb-2 ${!isOnlyPatient ? "text-primary" : "text-dark"}`}
                          style={{ 
                            cursor: !isOnlyPatient ? "pointer" : "default",
                            textDecoration: !isOnlyPatient ? "underline" : "none",
                            textDecorationColor: !isOnlyPatient ? "rgba(13, 110, 253, 0.3)" : "transparent"
                          }}
                          onClick={() => !isOnlyPatient && appointment.treatment?.id && navigate(`/treatments/${appointment.treatment.id}`)}
                        >
                          {appointment.treatment?.name || "—"}
                        </div>
                        {appointment.treatment?.description && (
                          <p className="text-muted mb-0 small">
                            {appointment.treatment.description}
                          </p>
                        )}
                      </div>
                    </Col>

                    {/* Precio */}
                    <Col md={6}>
                      <div>
                        <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "600" }}>
                          Precio
                        </h6>
                        <div className="fs-3 fw-bold text-success">
                          {appointment.treatment?.price 
                            ? `${parseFloat(appointment.treatment.price).toFixed(2)}€` 
                            : "—"}
                        </div>
                      </div>
                    </Col>

                    {/* Paciente - solo si no es paciente */}
                    {!isOnlyPatient && (
                      <Col md={6}>
                        <div>
                          <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "600" }}>
                            Paciente
                          </h6>
                          <div 
                            className="fs-5 fw-semibold text-primary"
                            style={{ 
                              cursor: "pointer",
                              textDecoration: "underline",
                              textDecorationColor: "rgba(13, 110, 253, 0.3)"
                            }}
                            onClick={() => appointment.patient?.user_id && navigate(`/users/${appointment.patient.user_id}`)}
                          >
                            {appointment.patient?.full_name ? capitalize(appointment.patient.full_name) : "—"}
                          </div>
                        </div>
                      </Col>
                    )}

                    {/* Terapeuta */}
                    <Col md={6}>
                      <div>
                        <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "600" }}>
                          Terapeuta
                        </h6>
                        <div 
                          className={`fs-5 fw-semibold ${!isOnlyPatient ? "text-primary" : "text-dark"}`}
                          style={{ 
                            cursor: !isOnlyPatient ? "pointer" : "default",
                            textDecoration: !isOnlyPatient ? "underline" : "none",
                            textDecorationColor: !isOnlyPatient ? "rgba(13, 110, 253, 0.3)" : "transparent"
                          }}
                          onClick={() => !isOnlyPatient && appointment.therapist?.user_id && navigate(`/users/${appointment.therapist.user_id}`)}
                        >
                          {appointment.therapist?.full_name ? capitalize(appointment.therapist.full_name) : "—"}
                        </div>
                      </div>
                    </Col>

                    {/* Bono - si existe */}
                    {appointment.patient_bono_id != null && (
                      <Col md={6}>
                        <div>
                          <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "600" }}>
                            <i className="bi bi-ticket-perforated me-1"></i>
                            Bono Aplicado
                          </h6>
                          <div className="fs-5 fw-semibold text-success">
                            {appointment.patient_bono_name || "Bono"}
                          </div>
                        </div>
                      </Col>
                    )}

                    {/* Sala - solo si no es paciente */}
                    {!isOnlyPatient && (
                      <Col md={6}>
                        <div>
                          <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "600" }}>
                            Sala
                          </h6>
                          <div 
                            className="fs-5 fw-semibold text-primary"
                            style={{ 
                              cursor: "pointer",
                              textDecoration: "underline",
                              textDecorationColor: "rgba(13, 110, 253, 0.3)"
                            }}
                            onClick={() => appointment.room?.id && navigate(`/rooms/${appointment.room.id}`)}
                          >
                            {appointment.room?.name || "—"}
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
