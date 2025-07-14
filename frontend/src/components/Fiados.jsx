// src/pages/Fiados.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Fiados() {
  const [ventasFiadas, setVentasFiadas] = useState([]);

  const cargarFiados = async () => {
    try {
      const res = await axios.get('/ventas/historial');
      const fiados = res.data.filter(v => v.fiado);
      setVentasFiadas(fiados);
    } catch {
      Swal.fire('Error', 'No se pudo cargar la lista de ventas fiadas.', 'error');
    }
  };

  const marcarComoPagada = async (id) => {
    try {
      await axios.patch(`/ventas/${id}/pagar`);
      Swal.fire('Éxito', 'Venta marcada como pagada.', 'success');
      cargarFiados();
    } catch {
      Swal.fire('Error', 'No se pudo marcar como pagada.', 'error');
    }
  };

  useEffect(() => {
    cargarFiados();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold text-primary">📄 Ventas Fiadas</h2>

      {ventasFiadas.length === 0 ? (
        <div className="alert alert-info text-center">No hay ventas fiadas registradas.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Comentario</th>
                <th>Pagada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiadas.map((venta) => (
                <tr key={venta.id}>
                  <td>{venta.id}</td>
                  <td>{new Date(venta.fecha).toLocaleString()}</td>
                  <td>${venta.total.toFixed(2)}</td>
                  <td>{venta.comentario || '-'}</td>
                  <td>
                    {venta.pagada ? (
                      <span className="badge bg-success">Pagada</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Pendiente</span>
                    )}
                  </td>
                  <td>
                    <Link to={`/ventas/detalle/${venta.id}`} className="btn btn-sm btn-outline-info me-2">
                      🔍 Ver
                    </Link>
                    {!venta.pagada && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => marcarComoPagada(venta.id)}
                      >
                        💵 Marcar pagada
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
