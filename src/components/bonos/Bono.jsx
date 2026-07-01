import { useParams } from "react-router-dom";
import { getBono } from "../../api/bono.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Badge } from "react-bootstrap";
import Header from "../layouts/Header.jsx";
import DetailLayout from "../layouts/DetailLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { buyPatientBono } from "../../api/patientBono.js";
import { getPatients } from "../../api/patient.js";
import { toast } from "react-toastify";
import { Modal, Form } from "react-bootstrap";
import Select from "react-select";
import { capitalize } from "../../utils/strings.js";
import PaymentModal from "../common/PaymentModal.jsx";

// Estilos personalizados para react-select
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "48px",
    borderColor: state.isFocused ? "#8fae3d" : "#ced4da",
    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(143, 174, 61, 0.25)" : null,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#8fae3d"
      : state.isFocused
      ? "#e6edd6"
      : "white",
    color: state.isSelected ? "white" : "#1a1a1a",
  }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function Bono() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [bono, setBono] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isPatient = user?.roles?.includes("patient");
  const isTherapist = user?.roles?.includes("therapist");
  const isAdmin = user?.roles?.includes("admin");
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
 
  useEffect(() => {
    getBono(id)
      .then((data) => setBono(data))
      .catch(() => setError("Error al cargar el bono"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOpenModal = async () => {
    try {
      // Traer todos los pacientes para el select
      const res = await getPatients();
      setPatients(res.data.data || []);
      setSelectedPatient(null);
      setShowModal(true);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error("No se pudieron cargar los pacientes");
    }
  };

  const handleOpenPaymentModal = () => {
    if (!user) return navigate("/login");
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    try {
      await buyPatientBono({
        user_id: user.id,
        bono_id: bono.id,
      });

      toast.success("Bono comprado correctamente");

      // Esperar a que se determine si es paciente
      if (isPatient === null) return; 

      if (isPatient) {
        navigate("/current-user/profile");
      } else {
        navigate(`/current-user/profile`);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error("No se pudo comprar el bono");
      throw error;
    }
  };

  const handleSell = async () => {
    if (!user) return navigate("/login");

    if (!selectedPatient) {
      toast.error("Debes seleccionar un paciente");
      return;
    }

    try {
      if (isTherapist || isAdmin) {
      await buyPatientBono({
          user_id: selectedPatient,
          bono_id: bono.id,
        });
        toast.success("Bono vendido correctamente");
        setShowModal(false);
        navigate(`/users/${selectedPatient}`);
      } else {
        toast.error("No tienes permisos para vender bonos a pacientes");
        navigate(`/bonos/${bono.id}`);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error("No se pudo vender el bono a paciente");
      navigate(`/bonos/${bono.id}`);
    }
  };



  if (loading)
    return (
      <>
        <Header 
          title="Detalles de Bono" 
          backButton={true}
        />
        <DetailLayout loading={loading} />
      </>
    );

  if (error) 
    return (
      <>
        <Header 
          title="Detalles de Bono" 
          backButton={true}
        />
        <DetailLayout error={error} />
      </>
    );

  return (
    <>
      <Header
        title={bono.name}
        subtitle={`${bono.sessions} sesiones`}
        backButton={true}
      />
      <div className="container-fluid px-4 pt-3">
        {isAdmin && (
        <button
          className="btn btn-outline-dark d-flex align-items-center gap-2"
          onClick={() => navigate(`/bonos/${bono.id}/edit`)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-pencil"
            viewBox="0 0 16 16"
          >
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
          </svg>
          Editar
        </button>
        )}
      </div>
      <div className="container-fluid px-4 py-3">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm bg-light border-0">
              <div className="card-body p-4">
                <div className="mb-4">
                  <h6 className="text-uppercase fw-bold text-center fs-4">
                    {bono.name}
                  </h6>
                  <hr />

                  <div className="d-flex align-items-center gap-2">
                    <h6 className="text-uppercase fw-bold mt-4">Incluye:</h6>
                    <Badge bg="success" className="fs-4 px-3 py-2">
                      {bono.sessions} sesiones
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 d-flex align-items-center gap-2">
                  <h6 className="text-uppercase fw-bold">Precio:</h6>
                  <p className=" fs-2 fw-bold text-success">
                    {bono.price
                      ? `${parseFloat(bono.price).toFixed(2)}€`
                      : "Sin precio definido"}
                  </p>
                </div>
                <div>
                  {isPatient && (
                    <Button
                      variant="success"
                      className="w-100 mb-2"
                      onClick={handleOpenPaymentModal}
                    >
                      Comprar
                    </Button>
                  )}

                  {isTherapist && (
                    <>
                     

                      {/* Vender a un paciente */}
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={handleOpenModal}
                      >
                        Vender a paciente
                      </Button>
                    </>
                  )}

                  {isAdmin && (
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={handleOpenModal}
                    >
                      Vender a paciente
                    </Button>
                  )}
                  {/* Modal para seleccionar paciente */}
                  <Modal 
                    show={showModal} 
                    onHide={() => setShowModal(false)}
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Vender bono a paciente</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group>
                          <Form.Label>Selecciona un paciente</Form.Label>
                          <Select
                            options={patients.map((p) => ({
                              value: p.user.id,
                              label: `${capitalize(p.full_name)}`,
                            }))}
                            value={
                              selectedPatient
                                ? patients
                                    .map((p) => ({
                                      value: p.user.id,
                                      label: `${capitalize(p.full_name)} - ID: ${p.user.id}`,
                                    }))
                                    .find((opt) => opt.value === selectedPatient)
                                : null
                            }
                            onChange={(option) =>
                              setSelectedPatient(option ? option.value : null)
                            }
                            placeholder="Buscar paciente por nombre..."
                            isClearable
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            noOptionsMessage={() => "No se encontraron pacientes"}
                          />
                        </Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        variant="success" 
                        onClick={handleSell}
                        disabled={!selectedPatient}
                      >
                        Vender
                      </Button>
                    </Modal.Footer>
                  </Modal>

                  {/* Modal de pago */}
                  <PaymentModal
                    show={showPaymentModal}
                    onHide={() => setShowPaymentModal(false)}
                    onConfirmPayment={handleConfirmPayment}
                    amount={bono?.price ? parseFloat(bono.price).toFixed(2) : "0.00"}
                    itemName={`Bono: ${bono?.name} (${bono?.sessions} sesiones)`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

