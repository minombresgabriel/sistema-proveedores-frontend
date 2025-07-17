import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAsistencia, setBusquedaAsistencia] = useState("");

  const [fecha, setFecha] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [formUsuario, setFormUsuario] = useState({
    nombre: "",
    cedula: "",
    pin: "",
    rol: "user",
  });
  const [editandoId, setEditandoId] = useState(null);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get("/admin/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const obtenerFechaHoy = () => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const localDate = new Date(hoy.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  const buscarAsistencias = async () => {
    if (!fecha) return setMensaje("Por favor selecciona una fecha");
    try {
      const res = await axios.get(
        `/admin/asistencias/por-fecha?fecha=${fecha}`
      );
      setAsistencias(res.data);
      console.log("Asistencias cargadas:", res.data);

      setMensaje("");
    } catch (err) {
      console.error("Error al obtener asistencias:", err);
      setMensaje("Error al obtener asistencias");
    }
  };

  const asistenciasFiltradas = asistencias.filter((a) =>
    a.usuario?.nombre.toLowerCase().includes(busquedaAsistencia.toLowerCase())
  );

  const exportarExcel = async () => {
    try {
      const res = await axios.get(`/admin/exportar-excel`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `asistencias_${fecha || "todas"}.xlsx`;
      link.click();
    } catch (err) {
      console.error("Error al exportar:", err);
    }
  };

  const manejarCambio = (e) => {
    setFormUsuario({
      ...formUsuario,
      [e.target.name]: e.target.value,
    });
  };

  const crearOActualizarUsuario = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await axios.put(`/admin/actualizar-usuario/${editandoId}`, formUsuario);
        setMensaje("Usuario actualizado exitosamente");
      } else {
        await axios.post("/admin/crear-usuario", formUsuario);
        setMensaje("Usuario creado exitosamente");
      }

      obtenerUsuarios();
      cerrarModal();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      setMensaje(error.response?.data?.message || "Error al guardar usuario");
    }
  };

  const editarUsuario = (usuario) => {
    setEditandoId(usuario._id);
    setFormUsuario({
      nombre: usuario.nombre,
      cedula: usuario.cedula,
      pin: "",
      rol: usuario.rol || "user",
    });
    setShowModal(true);
    setMensaje("");
  };

  const cerrarModal = () => {
    setEditandoId(null);
    setFormUsuario({ nombre: "", cedula: "", pin: "", rol: "user" });
    setShowModal(false);
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await axios.delete(`/admin/eliminar-usuario/${id}`);
      setMensaje("Usuario eliminado correctamente");
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setMensaje("Error al eliminar usuario");
    }
  };

  const eliminarAsistencia = async (id) => {
    try {
      await axios.delete(`/admin/eliminar-asistencia/${id}`);
      setAsistencias((prev) => prev.filter((a) => a._id !== id));
      setMensaje("Asistencia eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar:", err);
      setMensaje("No se pudo eliminar la asistencia");
    }
  };

  useEffect(() => {
    const hoy = obtenerFechaHoy();
    setFecha(hoy);
    obtenerUsuarios();
  }, []);

  useEffect(() => {
    if (fecha) {
      buscarAsistencias();
    }
  }, [fecha]);

  const usuariosNormales = usuarios.filter((u) => u.rol === "user");

  const asistenciasDeUsuarios = asistencias.filter((a) => {
    const fechaAsistencia = new Date(a.fecha).toISOString().split("T")[0];
    return fechaAsistencia === fecha && a.usuario?.rol === "user";
  });

  const usuariosConIds = new Set(
    asistenciasDeUsuarios.map((a) => a.usuario._id)
  );

  const usuariosSinAsistencia = usuariosNormales.filter(
    (u) => !usuariosConIds.has(u._id)
  );

  return (
    <div
      className="min-vh-100 py-4"
      style={{
        background: "linear-gradient(to bottom, #1e1e2f, #2d2f4a)",
        color: "#fff",
      }}
    >
      <div className="container mt-5">
        {/* Encabezado */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
          {/* Tarjetas informativas (izquierda) */}
          <div className="d-flex gap-3 flex-wrap align-items-center">
            <div
              className="card border-0 shadow-sm rounded-4"
              style={{ width: "150px", minHeight: "80px" }}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center py-2 px-2">
                <div className="text-muted small fw-semibold mb-1">
                  📅 Fecha
                </div>
                <div className="fw-bold text-dark small">{fecha}</div>
              </div>
            </div>

            <div
              className="card border-0 shadow-sm rounded-4 bg-success text-white"
              style={{ width: "150px", minHeight: "80px" }}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center py-2 px-2">
                <div className="small fw-semibold mb-1">✅ Ingresaron</div>
                <div className="fs-5 fw-bold">{asistencias.length}</div>
              </div>
            </div>

            <div
              className="card border-0 shadow-sm rounded-4 bg-danger text-white"
              style={{ width: "150px", minHeight: "80px" }}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center py-2 px-2">
                <div className="small fw-semibold mb-1">❌ No ingresaron</div>
                <div className="fs-5 fw-bold">
                  {usuariosSinAsistencia.length - asistencias.length}
                </div>
              </div>
            </div>
          </div>

          {/* Título (centro) y botón (derecha) */}
          <div className="d-flex align-items-center ms-auto gap-3 mt-3 mt-md-0">
            <h2 className="fw-bold text-white text-nowrap mb-0 pe-5 text-decoration-underline">
              Panel de Administración
            </h2>
            <button
              className="btn btn-outline-danger fw-semibold"
              onClick={cerrarSesion}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {mensaje && <Alert variant="warning">{mensaje}</Alert>}

        {/* Contenedor de dos columnas */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="p-3 bg-white rounded shadow-sm h-100 d-flex flex-column">
              <h5 className="fw-bold mb-3 text-dark">📅 Asistencias De Hoy</h5>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="form-control"
                  style={{ maxWidth: "180px" }}
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="form-control"
                  style={{ maxWidth: "200px" }}
                  value={busquedaAsistencia}
                  onChange={(e) => setBusquedaAsistencia(e.target.value)}
                />
              </div>

              <div
                className="table-responsive overflow-auto"
                style={{ minHeight: "300px", maxHeight: "500px" }}
              >
                <table className="table table-striped align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Usuario</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Hora</th>
                      <th scope="col" className="text-end">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistenciasFiltradas.map((a) => {
                      const fechaObj = new Date(a.fecha);
                      const fechaStr = fechaObj.toLocaleDateString();

                      const horaStr = fechaObj.toLocaleTimeString();

                      return (
                        <tr key={a._id}>
                          <td>{a.usuario?.nombre || "Desconocido"}</td>
                          <td>{fechaStr}</td>
                          <td>{horaStr}</td>
                          <td className="text-end">
                            <button
                              onClick={() => eliminarAsistencia(a._id)}
                              className="btn btn-sm btn-danger"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Usuarios */}
          <div className="col-md-5 mb-4">
            <div className=" card-panel p-3 bg-white rounded shadow-sm h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                {/* Título */}
                <h5 className="fw-bold text-dark mb-0">Usuarios Registrados</h5>

                {/* Contenedor del input + botón */}
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm shadow-sm"
                    placeholder="Buscar por nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: "180px" }}
                  />
                  <button
                    className="btn btn-success btn-md rounded-3 fw-bold px-3"
                    onClick={() => setShowModal(true)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div
                className="overflow-auto"
                style={{ minHeight: "300px", maxHeight: "500px" }}
              >
                <ul className="list-group">
                  {usuariosFiltrados.map((u) => (
                    <li
                      key={u._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{u.nombre}</strong> –{" "}
                        <span className="text-muted">{u.rol}</span>
                        <br />
                        <small className="text-muted">Cédula: {u.cedula}</small>
                      </div>
                      <div>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => editarUsuario(u)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => eliminarUsuario(u._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Asistencias */}
        </div>

        {/* Modal para crear/editar usuario */}
        <Modal show={showModal} onHide={cerrarModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {editandoId ? "✏️ Editar Usuario" : " Crear Usuario"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={crearOActualizarUsuario}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formUsuario.nombre}
                  onChange={manejarCambio}
                  required
                />
              </Form.Group>

              {!editandoId && (
                <Form.Group className="mb-3">
                  <Form.Label>Cédula</Form.Label>
                  <Form.Control
                    type="text"
                    name="cedula"
                    value={formUsuario.cedula}
                    onChange={manejarCambio}
                    required
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>
                  {editandoId ? "Nuevo PIN (opcional)" : "PIN"}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="pin"
                  value={formUsuario.pin}
                  onChange={manejarCambio}
                  placeholder={editandoId ? "Opcional" : ""}
                  required={!editandoId}
                />
              </Form.Group>

              {!editandoId && (
                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    name="rol"
                    value={formUsuario.rol}
                    onChange={manejarCambio}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                </Form.Group>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={cerrarModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editandoId ? "Actualizar" : "Crear"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
