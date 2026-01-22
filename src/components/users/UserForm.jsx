import { useState } from "react";
import { Spinner } from "react-bootstrap";
import "./Users.css";


/**
 * Componente de formulario reutilizable para crear/editar usuarios
 * @param {Object} props
 * @param {Object} props.initialData - Datos iniciales del usuario (para edición)
 * @param {Array<string>} props.currentRole - Roles actuales del usuario (para edición)
 * @param {Function} props.onSubmit - Callback al enviar el formulario
 * @param {Function} props.onCancel - Callback al cancelar
 * @param {boolean} props.isNewUser - Si es un nuevo usuario (mostrar campo contraseña como requerido)
 * @param {boolean} props.isAdmin - Si el usuario actual es administrador
 * @param {string} props.submitButtonText - Texto del botón de envío
 * @param {string} props.variant - Variante del estilo ('light' | 'dark')
 */
export default function UserForm({
  initialData = {},
  currentRole,
  onSubmit,
  onCancel,
  isNewUser = false,
  isAdmin = false,
  submitButtonText = "Guardar",
  variant = "light"
}) {
  // Determinar el rol principal para el select (prioridad: therapist > patient)
  const getPrimaryRole = (roles) => {
    if (!roles || !Array.isArray(roles)) return "patient";
    if (roles.includes("therapist")) return "therapist";
    if (roles.includes("patient")) return "patient";
    return "patient";
  };

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    surname: initialData.surname || "",
    dni: initialData.dni || "",
    address: initialData.address || "",
    email: initialData.email || "",
    password: "",
    phone: initialData.phone || "",
    birthdate: initialData.birthdate
      ? new Date(initialData.birthdate).toISOString().slice(0, 10)
      : "",
    role: getPrimaryRole(currentRole), // Rol principal basado en los roles actuales
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones básicas
    if (!formData.name || !formData.surname || !formData.email || !formData.birthdate || !formData.phone || !formData.address || !formData.dni) {
      setError("Por favor, completa todos los campos obligatorios");
      setLoading(false);
      return;
    }

    if (isNewUser && !formData.password) {
      setError("La contraseña es obligatoria para nuevos usuarios");
      setLoading(false);
      return;
    }

    // Preparar datos para enviar
    const dataToSubmit = { ...formData };
    
    // Si no es nuevo usuario y no hay contraseña, no enviarla
    if (!isNewUser && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }

    try {
      await onSubmit(dataToSubmit);
    } catch (err) {
      setError(err.message || "Error al guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const isDark = variant === "dark";
  const inputClass = isDark 
    ? "form-control bg-dark text-white border-success input-dark" 
    : "form-control";
  const labelClass = isDark 
    ? "form-label text-light fw-semibold" 
    : "form-label text-success fw-semibold";

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-6">
          <label className={labelClass}>
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass}
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="col-md-6">
          <label className={labelClass}>
            Apellidos <span className="text-danger">*</span>
          </label>
          <input
            className={inputClass}
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="col-md-4">
          <label className={labelClass}>DNI</label>
          <input
            className={inputClass}
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="col-md-4">
          <label className={labelClass}>Teléfono</label>
          <input
            className={inputClass}
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="col-md-4">
          <label className={labelClass}>Fecha de nacimiento</label>
          <input
            className={inputClass}
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="col-12">
          <label className={labelClass}>Dirección</label>
          <input
            className={inputClass}
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="col-md-6">
          <label className={labelClass}>
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            className={inputClass}
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="col-md-6">
          <label className={labelClass}>
            Contraseña {isNewUser && <span className="text-danger">*</span>}
          </label>
          <input
            type="password"
            className={inputClass}
            name="password"
            placeholder={
              isNewUser 
                ? "Ingresa la contraseña" 
                : "Dejar en blanco si no desea cambiarla"
            }
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required={isNewUser}
          />
        </div>

        {/* Campo de rol - Solo visible para admins al editar usuarios NO admin */}
        {!isNewUser && isAdmin && !currentRole?.includes("admin") && (
          <div className="col-12">
            
            <label className={labelClass}>
              Rol del Usuario
            </label>
            <select
              className={inputClass}
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="patient">Paciente</option>
              <option value="therapist">Terapeuta</option>
            </select>
            <small className="text-muted d-block mt-1">
              Roles actuales: <strong className="text-capitalize">
                {currentRole && Array.isArray(currentRole) 
                  ? currentRole.map(r => {
                      if (r === 'patient') return 'Paciente';
                      if (r === 'therapist') return 'Terapeuta';
                      if (r === 'admin') return 'Administrador';
                      return r;
                    }).join(', ')
                  : 'No asignado'
                }
              </strong>
            </small>
            <small className="text-info d-block mt-1">
              <i className="bi bi-info-circle me-1"></i>
              Selecciona el rol principal. El usuario puede tener múltiples roles.
            </small>
          </div>
        )}
       
        {/* Aviso cuando se edita un administrador */}
        {!isNewUser && isAdmin && currentRole?.includes('admin') && (
          <div className="col-12">
            <div className="alert alert-warning d-flex align-items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="flex-shrink-0 mt-1">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              <div className="flex-grow-1">
                <strong>Usuario Administrador</strong>
                <p className="mb-0 small">Este usuario tiene rol de <strong>Administrador</strong>. Los roles de administrador no pueden ser modificados.</p>
              </div>
            </div>
          </div>
        )}
      </div> 

      <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
        {onCancel && (
          <button
            type="button"
            className={`btn ${isDark ? 'btn-outline-light' : 'btn-outline-secondary'} px-4`}
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          className="btn btn-success px-4 d-flex align-items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              Guardando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
              </svg>
              {submitButtonText}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

