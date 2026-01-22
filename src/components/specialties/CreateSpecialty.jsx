import { useNavigate } from "react-router-dom";
import { createSpecialty } from "../../api/specialty.js";
import Header from "../layouts/Header.jsx";
import SpecialtyForm from "./SpecialtyForm.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { toast } from "react-toastify";

export default function CreateSpecialty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin");

  const handleSubmit = async (payload) => {
    try {
      await createSpecialty(payload);
      toast.success("Especialidad creada correctamente");
      navigate("/specialties");
    } catch {
      toast.error("No se pudo crear la especialidad");
    }
  };

  const handleCancel = () => {
    navigate("/specialties");
  };

  // No es administrador
  if (!isAdmin) {
    return (
      <>
        <Header
          title="Acceso Denegado"
          backButton={true}
        />
        <div className="container py-5">
          <div className="alert alert-warning" role="alert">
            <strong>Acceso denegado:</strong> Solo los administradores pueden crear especialidades.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Nueva Especialidad"
        subtitle="Crear una nueva especialidad"
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <SpecialtyForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  submitLabel="Crear especialidad"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

