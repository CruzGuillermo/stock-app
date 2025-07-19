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
      <h2 className="mb-4 fw-bold text-primary text-center">📄 Ventas Fiadas</h2>

      {ventasFiadas.length === 0 ? (
        <div className="alert alert-info text-center">No hay ventas fiadas registradas.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {ventasFiadas.map((venta) => (
            <div key={venta.id} className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-2">🧾 Venta #{venta.id}</h5>
                <p className="card-text mb-1"><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleString()}</p>
                <p className="card-text mb-1"><strong>Total:</strong> ${venta.total.toFixed(2)}</p>
                <p className="card-text mb-1"><strong>Comentario:</strong> {venta.comentario || '-'}</p>
                <p className="card-text mb-2">
                  <strong>Estado:</strong>{' '}
                  {venta.pagada ? (
                    <span className="badge bg-success">Pagada</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Pendiente</span>
                  )}
                </p>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <Link
                    to={`/ventas/detalle/${venta.id}`}
                    className="btn btn-outline-info w-100"
                  >
                    🔍 Ver detalle
                  </Link>
                  {!venta.pagada && (
                    <button
                      className="btn btn-success w-100"
                      onClick={() => marcarComoPagada(venta.id)}
                    >
                      💵 Marcar como pagada
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
