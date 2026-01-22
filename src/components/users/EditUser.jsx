import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  getUser,
  updateUser,
  addPatientToTherapist,
  changeTherapistToPatient,
  getUserRoleById,
} from "../../api/user";
import { useAuth } from "../../hooks/useAuth";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";
import UserForm from "./UserForm.jsx";
import { getUserRole } from "../../api/auth";
function EditUser() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const userIsAdmin = currentUser?.roles?.includes("admin");

  // Detecta si es edición del perfil propio
  const userId = location.pathname.includes("/current-user/profile")
    ? "me"
    : id;

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  async function loadUser() {
    try {
      const data = await getUser(userId);
      setUser(data.data || data);

      let role;
      if (userId === "me") {
        const roleResponse = await getUserRole();
        role = roleResponse?.roles || [];
      } else {
        // Solo para admin o terapeutas que editan otros usuarios
        const roleResponse = await getUserRoleById(userId);
        role =
          roleResponse.data?.role?.roles ||
          roleResponse.data?.data?.role?.roles ||
          [];
      }

      setUserRole(role);
    } catch (err) {
      console.error("Error al cargar usuario:", err);
      setError("No se pudo cargar el usuario");
    } finally {
      setLoading(false);
    }
  }

  if (userId && userId !== "undefined") {
    loadUser();
  } else {
    setError("ID de usuario inválido");
    setLoading(false);
  }
}, [userId]);

  async function handleSubmit(formData) {
    try {
      const newRole = formData.role;
      const { role: _role, ...userDataWithoutRole } = formData;

      // Actualizar usuario (sin el campo role)
      await updateUser(userId, userDataWithoutRole);

      // Cambiar rol si el usuario es admin
      if (newRole && userIsAdmin && userRole) {
        await handleRoleChange(userId, userRole, newRole);
      }

      // Redirige según tipo de edición
      if (userId === "me") {
        navigate("/current-user/profile");
        
      } else {
        navigate(`/users/${id}`);
      }
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  }
  
  async function handleRoleChange(userId, currentRoles, newRole) {
    // No permitir cambios si el usuario es admin
    if (currentRoles.includes("admin") || newRole === "admin") {
      return;
    }

    // Caso 1: Usuario es solo paciente y quiere ser terapeuta
    // Agregar rol de terapeuta (mantiene paciente)
    if (currentRoles.includes("patient") && !currentRoles.includes("therapist") && newRole === "therapist") {
      await addPatientToTherapist(userId);
    } 
    // Caso 2: Usuario es terapeuta (puede tener también paciente) y quiere ser solo paciente
    // Quitar rol de terapeuta, dejar solo paciente
    else if (currentRoles.includes("therapist") && newRole === "patient") {
      await changeTherapistToPatient(userId);
    }
  }

  if (loading) {
    return (
      <>
        <Header
          title="Editar Usuario"
          backButton={true}
        />
        <DetailLayout loading={loading} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          title="Editar Usuario"
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );
  }

  return (
    <>
      <Header
        title={`Editar: ${user?.name} ${user?.surname}`}
        subtitle={user?.email}
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <UserForm
                  initialData={user || {}}
                  currentRole={userRole}
                  onSubmit={handleSubmit}
                  onCancel={() =>
                    navigate(
                      userId === "me" ? "/current-user/profile" : `/users/${id}`
                    )
                  }
                  isNewUser={false}
                  isAdmin={userIsAdmin}
                  submitButtonText="Guardar Cambios"
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

export default EditUser;
