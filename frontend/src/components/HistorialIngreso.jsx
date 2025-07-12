import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function HistorialIngreso() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null); // ingreso en edición

  useEffect(() => {
    obtenerHistorial();
  }, []);

  const obtenerHistorial = async () => {
    try {
      const res = await axios.get('/ingresos-stock/historial');
      setHistorial(res.data);
    } catch (error) {
      console.error('Error al obtener historial:', error);
      Swal.fire('Error', 'No se pudo cargar el historial', 'error');
    } finally {
      setCargando(false);
    }
  };

  const eliminarIngreso = async (id) => {
    const confirm = await MySwal.fire({
      title: '¿Eliminar ingreso?',
      text: 'Se restará la cantidad del stock del producto correspondiente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`/ingresos-stock/${id}`);
        Swal.fire('Eliminado', 'Ingreso eliminado y stock actualizado.', 'success');
        obtenerHistorial();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el ingreso', 'error');
      }
    }
  };

  const guardarEdicion = async () => {
    const { id, producto_id, fecha, cantidad, precio_unitario, unidad, observaciones } = editando;

    if (!fecha || !cantidad || !precio_unitario || !unidad) {
      return Swal.fire('Error', 'Todos los campos obligatorios deben estar completos.', 'warning');
    }

    try {
      await axios.put(`/ingresos-stock/${id}`, {
        producto_id,
        fecha,
        cantidad,
        precio_unitario,
        unidad,
        observaciones,
      });
      Swal.fire('Actualizado', 'Ingreso actualizado correctamente', 'success');
      setEditando(null);
      obtenerHistorial();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar el ingreso', 'error');
    }
  };

  return (
    // ... imports y useEffect iguales
  <div className="container mt-5">
    <div className="bg-white p-4 rounded shadow-sm">
      <h2 className="text-center mb-4 text-primary fw-bold">📦 Historial de Ingresos de Stock</h2>

      {cargando ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : historial.length === 0 ? (
        <div className="alert alert-info text-center">No hay ingresos registrados aún.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle text-center">
            <thead className="table-light text-dark">
              <tr>
                <th>📅 Fecha</th>
                <th>🧴 Producto</th>
                <th>🔢 Cantidad</th>
                <th>📏 Unidad</th>
                <th>💲 Precio Unit.</th>
                <th>💰 Total</th>
                <th>📝 Observaciones</th>
                <th>⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((ingreso) => {
                const precioUnitarioNum = parseFloat(ingreso.precio_unitario) || 0;
                const cantidadNum = parseFloat(ingreso.cantidad) || 0;
                const total = precioUnitarioNum * cantidadNum;

                return (
                  <tr key={ingreso.id}>
                    <td>{new Date(ingreso.fecha).toLocaleDateString()}</td>
                    <td className="text-start">{ingreso.producto_nombre}</td>
                    <td>{cantidadNum}</td>
                    <td>{ingreso.unidad}</td>
                    <td>${precioUnitarioNum.toFixed(2)}</td>
                    <td className="fw-bold text-success">${total.toFixed(2)}</td>
                    <td>{ingreso.observaciones || '-'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => setEditando({ ...ingreso })}
                        title="Editar"
                      >
                        📝
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminarIngreso(ingreso.id)}
                        title="Eliminar"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Edición */}
      {editando && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: '#00000088' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">✏️ Editar Ingreso</h5>
                <button className="btn-close" onClick={() => setEditando(null)} />
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6 form-floating">
                      <input
                        type="date"
                        className="form-control"
                        id="fecha"
                        value={editando.fecha?.substring(0, 10)}
                        onChange={(e) => setEditando({ ...editando, fecha: e.target.value })}
                      />
                      <label htmlFor="fecha">📅 Fecha</label>
                    </div>

                    <div className="col-md-6 form-floating">
                      <input
                        type="number"
                        className="form-control"
                        min="0.01"
                        step="any"
                        id="cantidad"
                        value={editando.cantidad}
                        onChange={(e) =>
                          setEditando({ ...editando, cantidad: parseFloat(e.target.value) })
                        }
                      />
                      <label htmlFor="cantidad">🔢 Cantidad</label>
                    </div>

                    <div className="col-md-6 form-floating">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="0.01"
                        id="precio_unitario"
                        value={editando.precio_unitario}
                        onChange={(e) =>
                          setEditando({
                            ...editando,
                            precio_unitario: parseFloat(e.target.value),
                          })
                        }
                      />
                      <label htmlFor="precio_unitario">💲 Precio Unitario</label>
                    </div>

                    <div className="col-md-6 form-floating">
                      <select
                        className="form-select"
                        id="unidad"
                        value={editando.unidad}
                        onChange={(e) => setEditando({ ...editando, unidad: e.target.value })}
                      >
                        <option value="litro">Litro</option>
                        <option value="medio_litro">Medio Litro</option>
                        <option value="3litros">3 Litros</option>
                        <option value="unidad">Unidad</option>
                        <option value="kilogramo">Kilogramo</option>
                        <option value="gramo">Gramo</option>
                      </select>
                      <label htmlFor="unidad">📏 Unidad</label>
                    </div>

                    <div className="col-12 form-floating">
                      <textarea
                        className="form-control"
                        id="observaciones"
                        style={{ minHeight: '80px' }}
                        value={editando.observaciones || ''}
                        onChange={(e) =>
                          setEditando({ ...editando, observaciones: e.target.value })
                        }
                      />
                      <label htmlFor="observaciones">📝 Observaciones</label>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-outline-secondary" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={guardarEdicion}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
