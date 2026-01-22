import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function PaymentModal({ show, onHide, onConfirmPayment, amount, itemName }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [processing, setProcessing] = useState(false);

  // Validaciones
  const isCardNumberValid = cardNumber.replace(/\s/g, "").length >= 13 && cardNumber.replace(/\s/g, "").length <= 19;
  const isExpiryDateValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate);
  const isCvvValid = cvv.length >= 3 && cvv.length <= 4;
  const isCardholderNameValid = cardholderName.trim().length > 0;

  const isFormValid = isCardNumberValid && isExpiryDateValid && isCvvValid && isCardholderNameValid;

  // Formatear número de tarjeta (añadir espacios cada 4 dígitos)
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    if (value.length <= 19) {
      setCardNumber(formatted);
    }
  };

  // Formatear fecha de expiración (MM/YY)
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    
    if (value.length <= 5) {
      setExpiryDate(value);
    }
  };

  // Formatear CVV (solo números)
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setProcessing(true);
    
    // Simular procesamiento de pago
    setTimeout(async () => {
      try {
        await onConfirmPayment();
        handleClose();
      } catch (error) {
        console.error("Error en el pago:", error);
      } finally {
        setProcessing(false);
      }
    }, 1000);
  };

  const handleClose = () => {
    // Resetear formulario
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardholderName("");
    setProcessing(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="nm" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-credit-card me-2"></i>
          Método de Pago
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Total a pagar:</span>
            <span className="fs-4 fw-bold text-success">{amount}€</span>
          </div>
          {itemName && (
            <div className="mt-2">
              <small className="text-muted">{itemName}</small>
            </div>
          )}
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Nombre del titular <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre como aparece en la tarjeta"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              disabled={processing}
              isValid={cardholderName && isCardholderNameValid}
              isInvalid={cardholderName && !isCardholderNameValid}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Número de tarjeta <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              disabled={processing}
              isValid={cardNumber && isCardNumberValid}
              isInvalid={cardNumber && !isCardNumberValid}
            />
            <Form.Text className="text-muted">
              Entre 13 y 19 dígitos
            </Form.Text>
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>
                  Fecha de expiración <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  disabled={processing}
                  isValid={expiryDate && isExpiryDateValid}
                  isInvalid={expiryDate && !isExpiryDateValid}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>
                  CVV <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={handleCvvChange}
                  disabled={processing}
                  isValid={cvv && isCvvValid}
                  isInvalid={cvv && !isCvvValid}
                />
              </Form.Group>
            </div>
          </div>

          <div className="alert alert-info d-flex align-items-start" role="alert">
            <i className="bi bi-info-circle me-2 mt-1"></i>
            <small>
              Esta es una simulación de pago. Los datos ingresados no se almacenan ni procesan realmente.
            </small>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose} disabled={processing}>
          Cancelar
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={!isFormValid || processing}
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Procesando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Confirmar Pago
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
