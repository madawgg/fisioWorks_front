import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { Spinner, Modal } from "react-bootstrap";
import { register } from "../api/register.js";
import UserForm from "./users/UserForm.jsx";
import "./users/Users.css";

export default function Welcome() {
  const navigate = useNavigate();
  const { login, loginDemo, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones básicas
    if (!email || !password) {
      setError("Por favor, completa todos los campos");
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Error al iniciar sesión");
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError("");
    setLoading(true);

    const result = await loginDemo();

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Error al iniciar la demo");
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    try {
      // Registrar usuario (el backend crea el usuario Y el paciente automáticamente)
      await register(formData);
      
      // Intentar iniciar sesión automáticamente después del registro
      const result = await login(formData.email, formData.password);
      if (result.success) {
        setShowRegisterModal(false);
        navigate("/");
      } else {
        setShowRegisterModal(false);
        setError("Usuario creado correctamente. Por favor, inicia sesión.");
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error al crear el usuario");
    }
  };

  return (
    <div className="position-absolute start-0 top-0 d-flex flex-column justify-content-center align-items-center vh-100 vw-100 bg-dark text-success text-center">
      <div className="mb-5">
        <p className="fs-1 fw-bold mb-0">FisioWorks</p>
        <p className="fs-3 mt-0">Agenda</p>
      </div>

      <form
        className="bg-secondary bg-opacity-25 p-5 rounded-4 shadow-lg"
        style={{ width: "400px" }}
        onSubmit={handleSubmit}
      >
        <h2 className="mb-4 text-success">Iniciar Sesión</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="mb-3 text-start">
          <label htmlFor="email" className="form-label text-light">
            Correo electrónico
          </label>
          <input
            type="email"
            className="form-control bg-dark text-white border-success input-dark"
            id="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="mb-3 text-start">
          <label htmlFor="password" className="form-label text-light">
            Contraseña
          </label>
          <input
            type="password"
            className="form-control bg-dark text-light border-success input-dark"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-success w-100 mt-3"
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
                className="me-2"
              />
              Iniciando...
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <button
          type="button"
          className="btn btn-outline-light w-100 mt-2"
          onClick={handleDemo}
          disabled={loading}
        >
          Probar demo (solo lectura)
        </button>

        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-link text-light text-decoration-none"
            onClick={() => setShowRegisterModal(true)}
            disabled={loading}
          >
            ¿No tienes cuenta?{" "}
            <span className="text-success fw-bold">Regístrate</span>
          </button>
        </div>
      </form>

      {/* Modal de Registro */}
      <Modal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          className="bg-dark bg-opacity-75 border-success"
        >
          <Modal.Title className="text-olive fw-bold">Crear Nueva Cuenta</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark bg-opacity-75 p-4">
          <UserForm
            onSubmit={handleRegister}
            onCancel={() => setShowRegisterModal(false)}
            isNewUser={true}
            isAdmin={false}
            submitButtonText="Registrarse"
            variant="dark"
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

