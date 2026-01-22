import { getPatientAppointments, getSelfAppointments } from "../../api/patient.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth.js";

export default function PatientAppointments({ patientId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determinar si es el propio usuario paciente viendo su perfil
  const isSelfPatient = patientId === "me" || (user?.roles?.includes("patient") && user?.roles?.length === 1);

  useEffect(() => {
    // Si no hay patientId y no es el propio paciente, no cargar
    if (!patientId && !isSelfPatient) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Si es el propio paciente, usar getSelfAppointments
    if (isSelfPatient) {
      getSelfAppointments()
        .then((res) => setAppointments(res.data?.data || res.data || []))
        .catch(() => setAppointments([]))
        .finally(() => setLoading(false));
    } else {
      // Si es admin/terapeuta viendo otro paciente, usar getPatientAppointments
      getPatientAppointments(patientId)
        .then((res) => setAppointments(res.data?.data || res.data || []))
        .catch(() => setAppointments([]))
        .finally(() => setLoading(false));
    }
  }, [patientId, isSelfPatient]);

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
        <p className="text-muted mb-0 mt-2">No hay citas.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive" style={{ maxHeight: "350px" }}>
      <table className="table table-hover table-sm mb-0">
        <thead className="sticky-top bg-light">
          <tr>
            <th className="ps-3">Fecha</th>
            <th>Terapeuta</th>
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
              <td>{apt.therapist?.full_name || "—"}</td>
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
