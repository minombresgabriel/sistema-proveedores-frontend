import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

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
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const buscarAsistencias = async () => {
    if (!fecha) {
      setMensaje("Por favor selecciona una fecha");
      return;
    }

    try {
      console.log("Buscando asistencias para fecha:", fecha);
      const res = await axios.get(
        `/admin/asistencias/por-fecha?fecha=${fecha}`
      );
      setAsistencias(res.data);
      setMensaje("");
    } catch (err) {
      console.error("Error al obtener asistencias:", err);
      setMensaje("Error al obtener asistencias");
      setAsistencias([]);
    }
  };

  const asistenciasFiltradas = asistencias.filter((a) =>
    (a.usuario?.nombre || "")
      .toLowerCase()
      .includes(busquedaAsistencia.toLowerCase())
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
    if (!/^[a-zA-Z\s]+$/.test(formUsuario.nombre)) {
      setMensaje("El nombre solo debe contener letras.");
      return;
    }
    if (!/^\d+$/.test(formUsuario.cedula)) {
      setMensaje("La cédula solo debe contener números.");
      return;
    }
    if (!/^\d+$/.test(formUsuario.pin)) {
      setMensaje("El PIN solo debe contener números.");
      return;
    }

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
    if (!window.confirm("¿Estás seguro de eliminar esta asistencia?")) return;
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

  const asistentesUnicos = new Set(
    asistencias
      .map((a) => {
        const userId = a?.usuario?._id || a?.usuario;
        return userId ? userId.toString() : null;
      })
      .filter(Boolean)
  );

  const ingresaron = asistentesUnicos.size;
  const noIngresaron = Math.max(usuariosNormales.length - ingresaron, 0);
  return (
    <div
      className="admin-panel"
      style={{
        background: "linear-gradient(135deg, #1e1e2f 0%, #2d2f4a 100%)",
        color: "#fff",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <div className="container-fluid px-4">
        {/* Header Section */}
        <header className="admin-header mb-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4">
            <div>
              <h1 className="display-5 fw-bold text-white mb-2">
                <span className="text">Panel de Administración</span>
              </h1>
              <p className="text-muted mb-0">
                Gestión completa de usuarios y asistencias
              </p>
            </div>

            <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
              <div className="d-flex align-items-center bg-dark bg-opacity-25 px-3 py-2 rounded-pill">
                <i className="bi bi-calendar-check me-2"></i>
                <span className="fw-semibold">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <button className="btn btn-logout" onClick={cerrarSesion}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div
              className="stat-card bg-dark bg-opacity-25 rounded-4 p-4 h-100"
              style={{
                background:
                  "linear-gradient(to bottom right, rgba(30, 30, 47, 0.7), rgba(45, 47, 74, 0.5))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "1rem",
                padding: "1.5rem",
                height: "100%",
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-uppercase mb-2 text-white">
                    Total Usuarios
                  </h6>
                  <h3 className="mb-0">{usuariosFiltrados.length}</h3>
                </div>
                <div className="icon-circle bg-primary bg-opacity-10">
                  <i className="bi bi-people-fill text-primary"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="stat-card bg-dark bg-opacity-25 rounded-4 p-4 h-100"
              style={{
                background:
                  "linear-gradient(to bottom right, rgba(30, 30, 47, 0.7), rgba(45, 47, 74, 0.5))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "1rem",
                padding: "1.5rem",
                height: "100%",
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-uppercase  mb-2">Asistencias Hoy</h6>
                  <h3 className="mb-0">{ingresaron}</h3>
                </div>
                <div className="icon-circle bg-success bg-opacity-10">
                  <i className="bi bi-check-circle-fill text-success"></i>
                </div>
              </div>
              <div className="mt-3">
                <span className="badge bg-success bg-opacity-10 text-success">
                  +{((ingresaron / usuariosFiltrados.length) * 100).toFixed(1)}%
                  del total
                </span>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="stat-card bg-dark bg-opacity-25 rounded-4 p-4 h-100"
              style={{
                background:
                  "linear-gradient(to bottom right, rgba(30, 30, 47, 0.7), rgba(45, 47, 74, 0.5))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "1rem",
                padding: "1.5rem",
                height: "100%",
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-uppercase  mb-2">Faltantes Hoy</h6>
                  <h3 className="mb-0">{noIngresaron}</h3>
                </div>
                <div className="icon-circle bg-danger bg-opacity-10">
                  <i className="bi bi-x-circle-fill text-danger"></i>
                </div>
              </div>
              <div className="mt-3">
                <span className="badge bg-danger bg-opacity-10 text-danger">
                  {((noIngresaron / usuariosFiltrados.length) * 100).toFixed(1)}
                  % del total
                </span>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="stat-card bg-dark bg-opacity-25 rounded-4 p-4 h-100"
              style={{
                background:
                  "linear-gradient(to bottom right, rgba(30, 30, 47, 0.7), rgba(45, 47, 74, 0.5))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "1rem",
                padding: "1.5rem",
                height: "100%",
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-uppercase mb-2">Fecha Consulta</h6>
                  <h3 className="mb-0">
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="form-control form-control-transparent p-0 border-0"
                      style={{ width: "auto", display: "inline-block" }}
                    />
                  </h3>
                </div>
                <div className="icon-circle bg-info bg-opacity-10">
                  <i className="bi bi-calendar-date-fill text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {mensaje && (
          <div
            className="alert alert-warning alert-dismissible fade show mb-4"
            role="alert"
          >
            {mensaje}
            <button
              type="button"
              className="btn-close"
              onClick={() => setMensaje("")}
            ></button>
          </div>
        )}

        {/* Main Content */}
        <div className="row g-4">
          {/* Asistencias Section */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                  <div>
                    <h5 className="card-title mb-1">
                      <i className="bi bi-calendar-check me-2"></i>
                      Registro de Asistencias
                    </h5>
                    <p className="text-muted small mb-0">
                      Asistencias registradas para la fecha seleccionada
                    </p>
                  </div>
                  <div className="d-flex gap-2 mt-3 mt-md-0">
                    <div
                      className="input-group input-group-sm"
                      style={{ width: "200px" }}
                    >
                      <span className="input-group-text bg-transparent">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        placeholder="Buscar usuario..."
                        className="form-control"
                        value={busquedaAsistencia}
                        onChange={(e) => setBusquedaAsistencia(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="table-responsive"
                  style={{ maxHeight: "500px" }}
                >
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" width="40%">
                          Usuario
                        </th>
                        <th scope="col" width="20%">
                          Fecha
                        </th>
                        <th scope="col" width="20%">
                          Hora
                        </th>
                        <th scope="col" width="20%" className="text-end">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistenciasFiltradas.length > 0 ? (
                        asistenciasFiltradas.map((a) => {
                          const fechaObj = new Date(a.fecha);
                          const fechaStr = fechaObj.toLocaleString(); // Esto muestra la fecha y hora en formato local
                          const horaStr = fechaObj.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <tr key={a._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm me-2">
                                    <div className="avatar-title bg-light rounded-circle">
                                      <i className="bi bi-person-fill text-dark"></i>
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-0">
                                      {a.usuario?.nombre || "Desconocido"}
                                    </h6>
                                    <small className="text-muted">
                                      {a.usuario?.cedula || ""}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>{fechaStr}</td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {horaStr}
                                </span>
                              </td>
                              <td className="text-end">
                                <button
                                  onClick={() => eliminarAsistencia(a._id)}
                                  className="btn btn-sm btn-outline-danger"
                                  title="Eliminar asistencia"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-5">
                            <div className="py-4">
                              <i className="bi bi-calendar-x fs-1 text-muted"></i>
                              <p className="mt-2 text-muted">
                                No hay asistencias registradas para esta fecha
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Usuarios Section */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                  <div>
                    <h5 className="card-title mb-1">
                      <i className="bi bi-people-fill me-2"></i>
                      Gestión de Usuarios
                    </h5>
                    <p className="text-muted small mb-0">
                      Todos los usuarios registrados en el sistema
                    </p>
                  </div>
                  <div className="d-flex gap-2 mt-3 mt-md-0">
                    <div
                      className="input-group input-group-sm"
                      style={{ width: "200px" }}
                    >
                      <span className="input-group-text bg-transparent">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        placeholder="Buscar usuario..."
                        className="form-control"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-sm btn-success d-flex align-items-center"
                      onClick={() => setShowModal(true)}
                    >
                      <i className="bi bi-plus-lg me-1"></i> Nuevo
                    </button>
                  </div>
                </div>

                <div
                  className="user-list"
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  {usuariosFiltrados.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {usuariosFiltrados.map((u) => (
                        <div
                          key={u._id}
                          className="list-group-item list-group-item-action"
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-3">
                                <div
                                  className={`avatar-title rounded-circle ${
                                    u.rol === "admin"
                                      ? "bg-primary bg-opacity-10 text-primary"
                                      : "bg-light"
                                  }`}
                                >
                                  <i
                                    className={`bi ${
                                      u.rol === "admin"
                                        ? "bi-shield-fill"
                                        : "bi-person-fill"
                                    }`}
                                  ></i>
                                </div>
                              </div>
                              <div>
                                <h6 className="mb-0">{u.nombre}</h6>
                                <small className="text-muted">
                                  Cédula: {u.cedula}
                                </small>
                                <div className="mt-1">
                                  <span
                                    className={`badge ${
                                      u.rol === "admin"
                                        ? "bg-primary bg-opacity-10 text-primary"
                                        : "bg-light text-dark"
                                    }`}
                                  >
                                    {u.rol === "admin"
                                      ? "Administrador"
                                      : "Usuario"}
                                  </span>
                                </div>
                              </div>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-people fs-1 text-muted"></i>
                      <p className="mt-2 text-muted">
                        No hay usuarios registrados
                      </p>
                      <button
                        className="btn btn-sm btn-success mt-2"
                        onClick={() => setShowModal(true)}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Agregar primer
                        usuario
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Modal */}
      <Modal show={showModal} onHide={cerrarModal} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            <h5 className="modal-title">
              {editandoId ? (
                <>
                  <i className="bi bi-pencil-fill text-primary me-2"></i>
                  Editar Usuario
                </>
              ) : (
                <>
                  <i className="bi bi-plus-lg text-success me-2"></i>
                  Crear Nuevo Usuario
                </>
              )}
            </h5>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={crearOActualizarUsuario}>
          <Modal.Body className="pt-0">
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label>Nombre Completo</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person-fill text-muted"></i>
                    </span>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={formUsuario.nombre}
                      onChange={manejarCambio}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label>Cédula</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-card-text text-muted"></i>
                    </span>
                    <Form.Control
                      type="text"
                      name="cedula"
                      value={formUsuario.cedula}
                      onChange={manejarCambio}
                      placeholder="Ej: 1234567890"
                      required
                      disabled={editandoId}
                    />
                  </div>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label>
                    {editandoId ? "Nuevo PIN" : "PIN de Acceso"}
                  </Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock-fill text-muted"></i>
                    </span>
                    <Form.Control
                      type="password"
                      name="pin"
                      value={formUsuario.pin}
                      onChange={manejarCambio}
                      placeholder={editandoId ? "PIN" : "Ej: 1234"}
                      required={!editandoId}
                    />
                  </div>
                  {editandoId && (
                    <Form.Text className="text-muted">
                      Dejar en blanco para mantener el PIN actual
                    </Form.Text>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label>Rol del Usuario</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person-badge-fill text-muted"></i>
                    </span>
                    <Form.Select
                      name="rol"
                      value={formUsuario.rol}
                      onChange={manejarCambio}
                      className="form-select"
                      disabled={editandoId}
                    >
                      <option value="user">Usuario Normal</option>
                      <option value="admin">Administrador</option>
                    </Form.Select>
                  </div>
                </Form.Group>
              </div>
            </div>

            {editandoId && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle-fill me-2"></i>
                Al editar un usuario existente, solo complete los campos que
                desea cambiar.
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <button
              type="button"
              className="btn btn-light"
              onClick={cerrarModal}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editandoId ? (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Actualizar Usuario
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle-fill me-2"></i>
                  Crear Usuario
                </>
              )}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        .admin-panel {
          font-family: "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        }
        .text-gradient {
          background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stat-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        .icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .btn-logout {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          transition: all 0.3s;
        }
        .btn-logout:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }
        .form-control-transparent {
          background: transparent;
          color: inherit;
          border: none;
          box-shadow: none;
        }
        .form-control-transparent:focus {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .avatar-sm {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-title {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
