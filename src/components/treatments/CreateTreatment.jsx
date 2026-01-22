import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTreatment } from "../../api/treatment.js";
import Header from "../layouts/Header.jsx";

export default function CreateTreatment() {
  const navigate = useNavigate();

  const [treatment, setTreatment] = useState({
    name: "",
    price: "",
    description: "",
    duration: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTreatment({ ...treatment, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await createTreatment(treatment);
      const createdId = response.data?.data?.id || response.data?.id;
      navigate(`/treatments/${createdId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error al crear el tratamiento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header 
        title="Nuevo Tratamiento"
        subtitle="Crear un nuevo tratamiento"
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {error && (
              <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-success fw-semibold">
                      Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={treatment.name}
                      onChange={handleChange}
                      placeholder="Ej: Masaje terapéutico"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-success fw-semibold">
                      Precio (€) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={treatment.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-success fw-semibold">
                      Duración (minutos) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="duration"
                      value={treatment.duration}
                      onChange={handleChange}
                      placeholder="60"
                      min="1"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-success fw-semibold">Descripción</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={treatment.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Descripción del tratamiento..."
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => navigate("/treatments")}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-success px-4" disabled={saving}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg me-2" viewBox="0 0 16 16">
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                      </svg>
                      {saving ? "Creando..." : "Crear tratamiento"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
