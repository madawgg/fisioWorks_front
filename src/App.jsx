import 'bootstrap/dist/css/bootstrap.min.css';
import "react-toastify/dist/ReactToastify.css";
import { RouterProvider } from "react-router-dom";
import { adminRouter } from "./routes.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={adminRouter} />
    </AuthProvider>
  );
}

