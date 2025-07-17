import React, { useState, useEffect } from "react";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { Player } from "@lottiefiles/react-lottie-player";
import successAnimation from "../assets/animacion.json";
import { FaIdCard, FaKey } from "react-icons/fa";

const LoginPage = () => {
  const [cedula, setCedula] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/auth/login", { cedula, pin });
      const { token, rol, nombre } = res.data;
      localStorage.setItem("token", token);

      if (rol === "admin") {
        navigate("/admin");
      } else {
        setNombreUsuario(nombre); // Guardamos el nombre para mostrarlo

        setShowModal(true);
      }
    } catch (err) {
      setError("Cédula o PIN incorrectos");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCedula("");
    setPin("");
  };

  // Auto-cerrar el modal después de 3 segundos
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        handleCloseModal();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: "linear-gradient(to bottom, #1e1e2f, #2d2f4a)",
      }}
    >
      <div
        className="card shadow-lg border-0 p-4"
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "1rem",
          backgroundColor: "white",
        }}
      >
        <h3 className="text-center mb-4 fw-bold text-dark">Inicio de Sesión</h3>

        {error && (
          <div className="alert alert-danger text-center fw-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Cédula</label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <FaIdCard />
              </span>
              <input
                type="text"
                className="form-control"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">PIN</label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <FaKey />
              </span>
              <input
                type="password"
                className="form-control"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold"
            style={{
              transition: "0.3s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            Ingresar
          </button>
        </form>
      </div>

      {/* Modal con animación de éxito */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Body className="text-center p-4">
          <Player
            autoplay
            loop={false}
            src={successAnimation}
            style={{ height: "150px", width: "150px", margin: "auto" }}
          />
          <h4 className="mt-3 text-success fw-bold">¡Hola, {nombreUsuario}!</h4>
          <h5 className="mt-2"> Asistencia Confirmada</h5>
          <p className="text-muted">Gracias por registrar tu asistencia.</p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LoginPage;
