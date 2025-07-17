import React, { useEffect, useState } from "react";
import axios from "../services/api";

const UserDashboard = () => {
  const [user, setUser] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(false);

  const obtenerPerfil = async () => {
    try {
      const res = await axios.get("/user/perfil");
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const marcarAsistencia = async () => {
    try {
      const res = await axios.post("/user/marcar-asistencia");
      setMensaje(res.data.message);
      setAsistenciaRegistrada(true);
    } catch (err) {
      setMensaje(
        err.response?.data?.message || "Error al registrar asistencia"
      );
    }
  };

  useEffect(() => {
    obtenerPerfil();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Bienvenido, {user.nombre || "Usuario"}</h2>
      <p className="text-muted">Cédula: {user.cedula}</p>

      <button
        onClick={marcarAsistencia}
        className="btn btn-success"
        disabled={asistenciaRegistrada}
      >
        {asistenciaRegistrada ? "Asistencia Registrada" : "Marcar Asistencia"}
      </button>

      {mensaje && <div className="alert alert-info mt-3">{mensaje}</div>}
    </div>
  );
};

export default UserDashboard;
