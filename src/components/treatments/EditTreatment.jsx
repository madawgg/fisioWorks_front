import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTreatment, updateTreatment } from "../../api/treatment.js";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";

export default function EditTreatment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [treatment, setTreatment] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTreatment(id)
      .then((data) => setTreatment(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTreatment({ ...treatment, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTreatment(id, treatment);
      navigate(`/treatments/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) 
    return (
      <>
        <Header 
          title="Editar Tratamiento" 
          backButton={true}
        />
        <DetailLayout loading={loading} />
      </>
    );
    
  if (error) 
    return (
      <>
        <Header 
          title="Editar Tratamiento" 
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );

  return (
    <>
      <Header 
        title={`Editar: ${treatment.name}`}
        subtitle="Actualizar información del tratamiento"
        backButton={true}
      />
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-success fw-semibold">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={treatment.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-success fw-semibold">Precio (€)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={treatment.price}
                      onChange={handleChange}
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
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => navigate(`/treatments/${id}`)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-success px-4" disabled={saving}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg me-2" viewBox="0 0 16 16">
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                      </svg>
                      {saving ? "Guardando..." : "Guardar cambios"}
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
