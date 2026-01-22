import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/user";
import { createPatient } from "../../api/patient";
import { useAuth } from "../../hooks/useAuth";
import Header from "../layouts/Header.jsx";
import UserForm from "./UserForm.jsx";

function CreateUser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userIsAdmin = user?.roles?.includes("admin");
  const [error, setError] = useState(null);

  async function handleSubmit(formData) {
    try {
      // Eliminar el campo 'role' antes de crear el usuario
      // El rol se gestiona en tablas separadas
      const { role, ...userDataWithoutRole } = formData;
      
      // Crear usuario
      const userResponse = await createUser(userDataWithoutRole);
      const newUserId = userResponse.data?.data?.id || userResponse.data?.id;
      
      // Automáticamente crear como paciente
      if (newUserId) {
        await createPatient({ user_id: newUserId });
      }
      
      navigate("/users");
    } catch (err) {
      console.error("Error en handleSubmit:", err);
      setError("No se pudo crear el usuario");
      throw new Error("No se pudo crear el usuario");
    }
  }

  if (error) {
    return (
      <>
        <Header 
          title="Nuevo Usuario" 
          backButton={true}
        />
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Nuevo Usuario"
        subtitle="Completa el formulario para crear un nuevo usuario"
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <UserForm
                  initialData={{}}
                  currentRole={null}
                  onSubmit={handleSubmit}
                  onCancel={() => navigate("/users")}
                  isNewUser={true}
                  isAdmin={userIsAdmin}
                  submitButtonText="Crear Usuario"
                  variant="light"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateUser;

