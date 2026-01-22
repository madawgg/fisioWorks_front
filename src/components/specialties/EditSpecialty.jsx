import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSpecialty, updateSpecialty } from "../../api/specialty.js";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";
import SpecialtyForm from "./SpecialtyForm.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { toast } from "react-toastify";

export default function EditSpecialty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin");

  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSpecialty() {
      try {
        const data = await getSpecialty(id);
        setSpecialty(data);
      } catch {
        setError("No se pudo cargar la especialidad");
      } finally {
        setLoading(false);
      }
    }
    loadSpecialty();
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      await updateSpecialty(id, payload);
      toast.success("Especialidad actualizada correctamente");
      navigate(`/specialties/${id}`);
    } catch {
      toast.error("No se pudo actualizar la especialidad");
    }
  };

  const handleCancel = () => {
    navigate(`/specialties/${id}`);
  };

  // Cargando especialidad
  if (loading) {
    return (
      <>
        <Header
          title="Editar Especialidad"
          backButton={true}
        />
        <DetailLayout loading={loading} />
      </>
    );
  }

  // No es administrador
  if (!isAdmin) {
    return (
      <>
        <Header
          title="Acceso Denegado"
          backButton={true}
        />
        <DetailLayout error="Solo los administradores pueden editar especialidades." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          title="Editar Especialidad"
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );
  }

  return (
    <>
      <Header
        title={`Editar: ${specialty?.name}`}
        subtitle={`Especialidad Nº ${specialty?.id || id}`}
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <SpecialtyForm
                  initialData={specialty}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  submitLabel="Guardar cambios"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

