import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout.jsx";
import Welcome from "./components/Welcome.jsx";
import Users from "./components/users/Users.jsx";
import User from "./components/users/User.jsx";
import CreateUser from "./components/users/CreateUser.jsx";
import EditUser from "./components/users/EditUser.jsx";
import Agenda from "./components/calendar/Agenda.jsx";
import EditAppointment from "./components/calendar/EditAppointment.jsx";
import Rooms from "./components/rooms/Rooms.jsx";
import Room from "./components/rooms/Room.jsx";
import EditRoom from "./components/rooms/EditRoom.jsx";
import CreateRoom from "./components/rooms/CreateRoom.jsx";
import Treatments from "./components/treatments/Treatments.jsx";
import Treatment from "./components/treatments/Treatment.jsx";
import EditTreatment from "./components/treatments/EditTreatment.jsx";
import CreateTreatment from "./components/treatments/CreateTreatment.jsx";
import Bonos from "./components/bonos/Bonos.jsx";
import Bono from "./components/bonos/Bono.jsx";
import EditBono from "./components/bonos/EditBono.jsx";
import ShowPatientBono from "./components/bonos/ShowPatientBono.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Specialties from "./components/specialties/Specialties.jsx";
import Specialty from "./components/specialties/Specialty.jsx";
import EditSpecialty from "./components/specialties/EditSpecialty.jsx";
import CreateSpecialty from "./components/specialties/CreateSpecialty.jsx";
import { Navigate } from "react-router-dom";
import Appointment from "./components/calendar/Appointment.jsx";
import CreateMedicalHistory from "./components/medicalHistories/CreateMedicalHistory.jsx";
import MedicalHistory from "./components/medicalHistories/MedicalHistory.jsx";
import EditMedicalHistory from "./components/medicalHistories/EditMedicalHistory.jsx";

//import EditSpecialty from "./components/specialties/EditSpecialty.jsx";

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
    element: <Welcome />,
  },
]);
