import { getTherapistAppointments } from "../../api/therapist.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

export default function TherapistAppointments({ therapistId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!therapistId) return;
    
    setLoading(true);
    getTherapistAppointments(therapistId)
      .then((res) => setAppointments(res.data?.data || res.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [therapistId]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" className="text-olive" />
        <span className="ms-2">Cargando citas...</span>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted mb-0 mt-2">No hay citas como terapeuta.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive" style={{ maxHeight: "350px" }}>
      <table className="table table-hover table-sm mb-0">
        <thead className="sticky-top bg-light">
          <tr>
            <th className="ps-3">Fecha</th>
            <th>Paciente</th>
            <th>Tratamiento</th>
            <th className="text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr
              key={apt.id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/agenda/${apt.id}`)}
            >
              <td className="ps-3">
                {new Date(apt.appointment_date).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td>{apt.patient?.full_name || "—"}</td>
              <td>{apt.treatment?.name || "—"}</td>
              <td className="text-center">
                <span
                  className={`badge ${
                    apt.status === "completed"
                      ? "bg-success"
                      : apt.status === "scheduled"
                      ? "bg-primary"
                      : apt.status === "cancelled"
                      ? "bg-danger"
                      : apt.status === "pending"
                      ? "bg-warning"
                      : "bg-secondary"
                  }`}
                >
                  {apt.status === "completed"
                    ? "Completada"
                    : apt.status === "scheduled"
                    ? "Programada"
                    : apt.status === "cancelled"
                    ? "Cancelada"
                    : apt.status === "pending"
                    ? "Pendiente"
                    : apt.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

