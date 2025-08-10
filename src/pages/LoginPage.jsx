import React, { useState, useEffect } from "react";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { Player } from "@lottiefiles/react-lottie-player";
import successAnimation from "../assets/animacion.json";
import { FaIdCard, FaKey, FaExclamationTriangle } from "react-icons/fa";
import companyLogo from "../assets/cestatiked.png";

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
        setNombreUsuario(nombre);
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
      className="login-container"
      style={{
        background: "linear-gradient(135deg, #082359 0%, #4D5D8C 100%)", // Gradiente azul oscuro a azul medio
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Logo posicionado arriba y fuera de la card */}
      <div
        style={{
          marginBottom: "2rem",
          textAlign: "center",
          padding: "1rem",
          backgroundColor: "#F2F2F2", // Fondo gris claro para el logo
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <img
          src={companyLogo}
          alt="Logo de la empresa"
          style={{
            height: "100px",
            width: "auto",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Card del login */}
      <div
        className="login-card"
        style={{
          background: "rgba(242, 242, 242, 0.15)", // Fondo semitransparente gris claro
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(242, 242, 242, 0.2)", // Borde gris claro
          borderRadius: "1.5rem",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div className="text-center mb-4">
          <h2 className="text-white fw-bold mb-1">Bienvenido</h2>
          <p className="text-white" style={{ color: "#F2F2F2" }}>
            {" "}
            {/* Texto gris claro */}
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
            style={{
              backgroundColor: "#F25050", // Rojo claro
              borderColor: "#F21B1B", // Rojo oscuro
              color: "#082359", // Texto azul oscuro
            }}
          >
            <div className="d-flex align-items-center">
              <FaExclamationTriangle className="me-2" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
            />
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-4">
          <div className="mb-4">
            <label className="form-label mb-2" style={{ color: "#F2F2F2" }}>
              Cédula
            </label>
            <div className="input-group input-group-lg">
              <span
                className="input-group-text"
                style={{
                  backgroundColor: "#082359", // Azul oscuro
                  borderColor: "#4D5D8C", // Azul medio
                  color: "#F2F2F2", // Gris claro
                }}
              >
                <FaIdCard />
              </span>
              <input
                type="text"
                className="form-control"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ingresa tu cédula"
                required
                autoFocus
                style={{
                  backgroundColor: "rgba(242, 242, 242, 0.2)", // Gris claro semitransparente
                  borderColor: "#4D5D8C", // Azul medio
                  color: "#F2F2F2", // Texto gris claro
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label mb-2" style={{ color: "#F2F2F2" }}>
              PIN de acceso
            </label>
            <div className="input-group input-group-lg">
              <span
                className="input-group-text"
                style={{
                  backgroundColor: "#082359", // Azul oscuro
                  borderColor: "#4D5D8C", // Azul medio
                  color: "#F2F2F2", // Gris claro
                }}
              >
                <FaKey />
              </span>
              <input
                type="password"
                className="form-control"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                required
                style={{
                  backgroundColor: "rgba(242, 242, 242, 0.2)", // Gris claro semitransparente
                  borderColor: "#4D5D8C", // Azul medio
                  color: "#F2F2F2", // Texto gris claro
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-lg w-100 fw-bold py-3 mt-4"
            style={{
              background: "linear-gradient(to right, #082359 0%, #4D5D8C 100%)", // Gradiente azul
              border: "none",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 15px rgba(8, 35, 89, 0.4)",
              transition: "all 0.3s ease",
              color: "#F2F2F2", // Texto gris claro
              fontWeight: "bold",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(8, 35, 89, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(8, 35, 89, 0.4)";
            }}
          >
            Ingresar
          </button>
        </form>
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        backdrop="static"
        keyboard={false}
        contentClassName="border-0"
      >
        <Modal.Body
          className="p-5 text-center"
          style={{ backgroundColor: "#F2F2F2" }}
        >
          {" "}
          {/* Fondo gris claro */}
          <div className="success-animation-container mb-4">
            <Player
              autoplay
              loop={false}
              src={successAnimation}
              style={{ height: "150px", width: "150px" }}
            />
          </div>
          <h3 className="fw-bold mb-3" style={{ color: "#082359" }}>
            {" "}
            {/* Texto azul oscuro */}
            ¡Bienvenido, {nombreUsuario}!
          </h3>
          <p className="mb-4" style={{ color: "#4D5D8C" }}>
            {" "}
            {/* Texto azul medio */}
            Tu asistencia ha sido registrada correctamente
          </p>
          <button
            onClick={handleCloseModal}
            className="btn px-4"
            style={{
              background: "linear-gradient(to right, #082359 0%, #4D5D8C 100%)", // Gradiente azul
              border: "none",
              borderRadius: "0.5rem",
              color: "#F2F2F2", // Texto gris claro
              fontWeight: "bold",
            }}
          >
            Continuar
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LoginPage;
