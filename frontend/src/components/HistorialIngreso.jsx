import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function HistorialIngreso() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);

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
    <div className="container-fluid mt-4 px-2 px-sm-4">
      <div className="bg-white p-3 p-md-4 rounded shadow-sm">
        <h2 className="text-center mb-4 text-primary fw-bold">📦 Historial de Ingresos</h2>

        {cargando ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : historial.length === 0 ? (
          <div className="alert alert-info text-center">No hay ingresos registrados aún.</div>
        ) : (
          <>
            {/* Vista tarjetas en móvil */}
            <div className="d-block d-md-none">
              {historial.map((ingreso) => {
                const total = ingreso.cantidad * ingreso.precio_unitario;
                return (
                  <div key={ingreso.id} className="card mb-3 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title text-primary">{ingreso.producto_nombre}</h5>
                      <p className="card-text mb-1"><strong>📅 Fecha:</strong> {new Date(ingreso.fecha).toLocaleDateString()}</p>
                      <p className="card-text mb-1"><strong>🔢 Cantidad:</strong> {ingreso.cantidad} {ingreso.unidad}</p>
                      <p className="card-text mb-1"><strong>💲 Precio Unitario:</strong> ${ingreso.precio_unitario.toFixed(2)}</p>
                      <p className="card-text mb-1"><strong>💰 Total:</strong> ${total.toFixed(2)}</p>
                      <p className="card-text"><strong>📝 Obs.:</strong> {ingreso.observaciones || '-'}</p>

                      <div className="d-flex justify-content-end gap-2 mt-3">
                        <button
                          className="btn btn-sm btn-outline-warning w-50"
                          onClick={() => setEditando({ ...ingreso })}
                        >
                          📝 Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger w-50"
                          onClick={() => eliminarIngreso(ingreso.id)}
                        >
                          🗑 Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vista tabla en escritorio */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-bordered align-middle text-center table-sm">
                <thead className="table-light text-dark">
                  <tr>
                    <th>📅 Fecha</th>
                    <th>🧴 Producto</th>
                    <th>🔢 Cantidad</th>
                    <th>📏 Unidad</th>
                    <th>💲 Precio Unit.</th>
                    <th>💰 Total</th>
                    <th>📝 Observaciones</th>
                    <th>⚙️</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((ingreso) => {
                    const total = ingreso.cantidad * ingreso.precio_unitario;
                    return (
                      <tr key={ingreso.id}>
                        <td>{new Date(ingreso.fecha).toLocaleDateString()}</td>
                        <td className="text-start">{ingreso.producto_nombre}</td>
                        <td>{ingreso.cantidad}</td>
                        <td>{ingreso.unidad}</td>
                        <td>${ingreso.precio_unitario.toFixed(2)}</td>
                        <td className="fw-bold text-success">${total.toFixed(2)}</td>
                        <td>{ingreso.observaciones || '-'}</td>
                        <td className="d-flex justify-content-center gap-1 flex-wrap">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => setEditando({ ...ingreso })}
                          >
                            📝
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminarIngreso(ingreso.id)}
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
          </>
        )}

        {/* Modal edición igual */}
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
                          value={editando.fecha?.substring(0, 10)}
                          onChange={(e) => setEditando({ ...editando, fecha: e.target.value })}
                        />
                        <label>📅 Fecha</label>
                      </div>

                      <div className="col-md-6 form-floating">
                        <input
                          type="number"
                          className="form-control"
                          min="0.01"
                          step="any"
                          value={editando.cantidad}
                          onChange={(e) =>
                            setEditando({ ...editando, cantidad: parseFloat(e.target.value) })
                          }
                        />
                        <label>🔢 Cantidad</label>
                      </div>

                      <div className="col-md-6 form-floating">
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={editando.precio_unitario}
                          onChange={(e) =>
                            setEditando({
                              ...editando,
                              precio_unitario: parseFloat(e.target.value),
                            })
                          }
                        />
                        <label>💲 Precio Unitario</label>
                      </div>

                      <div className="col-md-6 form-floating">
                        <select
                          className="form-select"
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
                        <label>📏 Unidad</label>
                      </div>

                      <div className="col-12 form-floating">
                        <textarea
                          className="form-control"
                          style={{ minHeight: '80px' }}
                          value={editando.observaciones || ''}
                          onChange={(e) =>
                            setEditando({ ...editando, observaciones: e.target.value })
                          }
                        />
                        <label>📝 Observaciones</label>
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
