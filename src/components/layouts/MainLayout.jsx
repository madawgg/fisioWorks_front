import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function MainLayout() {
  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
      <Sidebar />
      <div className="flex-grow-1" style={{ overflow: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}

