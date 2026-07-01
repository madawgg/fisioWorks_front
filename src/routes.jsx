import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
// Agenda es la página de inicio (/ redirige a /agenda), así que se carga de
// forma inmediata para no mostrar un spinner al entrar. FullCalendar se separa
// en su propio chunk vía manualChunks (vite.config.js) para cargar en paralelo.
import Agenda from "./components/calendar/Agenda.jsx";

// Resto de páginas cargadas de forma diferida (code-splitting por ruta):
// cada una se descarga solo cuando se navega a su ruta.
const Welcome = lazy(() => import("./components/Welcome.jsx"));
const Users = lazy(() => import("./components/users/Users.jsx"));
const User = lazy(() => import("./components/users/User.jsx"));
const CreateUser = lazy(() => import("./components/users/CreateUser.jsx"));
const EditUser = lazy(() => import("./components/users/EditUser.jsx"));
const EditAppointment = lazy(() => import("./components/calendar/EditAppointment.jsx"));
const Rooms = lazy(() => import("./components/rooms/Rooms.jsx"));
const Room = lazy(() => import("./components/rooms/Room.jsx"));
const EditRoom = lazy(() => import("./components/rooms/EditRoom.jsx"));
const CreateRoom = lazy(() => import("./components/rooms/CreateRoom.jsx"));
const Treatments = lazy(() => import("./components/treatments/Treatments.jsx"));
const Treatment = lazy(() => import("./components/treatments/Treatment.jsx"));
const EditTreatment = lazy(() => import("./components/treatments/EditTreatment.jsx"));
const CreateTreatment = lazy(() => import("./components/treatments/CreateTreatment.jsx"));
const Bonos = lazy(() => import("./components/bonos/Bonos.jsx"));
const Bono = lazy(() => import("./components/bonos/Bono.jsx"));
const EditBono = lazy(() => import("./components/bonos/EditBono.jsx"));
const ShowPatientBono = lazy(() => import("./components/bonos/ShowPatientBono.jsx"));
const Specialties = lazy(() => import("./components/specialties/Specialties.jsx"));
const Specialty = lazy(() => import("./components/specialties/Specialty.jsx"));
const EditSpecialty = lazy(() => import("./components/specialties/EditSpecialty.jsx"));
const CreateSpecialty = lazy(() => import("./components/specialties/CreateSpecialty.jsx"));
const Appointment = lazy(() => import("./components/calendar/Appointment.jsx"));
const CreateMedicalHistory = lazy(() => import("./components/medicalHistories/CreateMedicalHistory.jsx"));
const MedicalHistory = lazy(() => import("./components/medicalHistories/MedicalHistory.jsx"));
const EditMedicalHistory = lazy(() => import("./components/medicalHistories/EditMedicalHistory.jsx"));

// Fallback a pantalla completa mientras se descarga el chunk de la página de login.
const pageLoader = (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ height: "100vh" }}
  >
    <div className="spinner-border text-success" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

export const adminRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/agenda" replace /> },
      { path: "/users", element: <Users /> },
      { path: "/users/:id", element: <User /> },
      { path: "/current-user/profile", element: <User /> },
      { path: "/current-user/profile/edit", element: <EditUser /> },
      { path: "/users/:id/edit", element: <EditUser /> },
      { path: "/users/new", element: <CreateUser /> },
      { path: "/agenda", element: <Agenda /> },
      { path: "/appointments/:id/edit", element: <EditAppointment /> },
      { path: "/rooms", element: <Rooms /> },
      { path: "/rooms/:id", element: <Room /> },
      { path: "/rooms/:id/edit", element: <EditRoom /> },
      { path: "/rooms/new", element: <CreateRoom /> },
      { path: "/treatments", element: <Treatments /> },
      { path: "/treatments/:id", element: <Treatment /> },
      { path: "/treatments/:id/edit", element: <EditTreatment /> },
      { path: "/treatments/new", element: <CreateTreatment /> },
      { path: "/bonos", element: <Bonos /> },
      { path: "/bonos/:id", element: <Bono /> },
      { path: "/bonos/:id/edit", element: <EditBono /> },
      { path: "/bonos/new", element: <EditBono /> },
      { path: "/patient-bonos/:id", element: <ShowPatientBono /> },
      { path: "/specialties", element: <Specialties /> },
      { path: "/specialties/:id", element: <Specialty /> },
      { path: "/specialties/:id/edit", element: <EditSpecialty /> },
      { path: "/specialties/new", element: <CreateSpecialty /> },
      { path: "/agenda/:id", element: <Appointment /> },
      {
        path: "/users/:userId/medical-history/create",
        element: <CreateMedicalHistory />,
      },
      { path: "/medical-histories/:id", element: <MedicalHistory /> },
      { path: "/medical-histories/:id/edit", element: <EditMedicalHistory /> },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={pageLoader}>
        <Welcome />
      </Suspense>
    ),
  },
]);
