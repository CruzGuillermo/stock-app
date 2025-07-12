import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      const res = await axios.get('/ventas');
      setVentas(res.data);
    } catch {
      setError('Error cargando historial de ventas');
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">📈 Historial de Ventas</h2>
        <p className="text-muted">Listado completo de ventas registradas</p>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm fw-semibold text-center">
          {error}
        </div>
      )}

      <div className="table-responsive rounded shadow-sm border border-light">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-center">
            <tr>
              <th>ID</th>
              <th>📦 Producto</th>
              <th>🔢 Cantidad</th>
              <th>🏷️ Oferta</th>
              <th>🗓️ Fecha</th>
              <th>🔍 Detalle</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  <span className="d-block mb-2">🛒 No se encontraron ventas registradas.</span>
                  <small>Registra ventas para visualizarlas aquí.</small>
                </td>
              </tr>
            ) : (
              ventas
                .sort((a, b) => b.venta_id - a.venta_id)
                .map((v) => (
                  <tr key={v.venta_id + v.nombre_producto}>
                    <td className="text-center fw-bold text-secondary">{v.venta_id}</td>
                    <td>{v.nombre_producto}</td>
                    <td className="text-center">
                      {v.cantidad}{" "}
                      {v.unidad && (
                        <span className="badge bg-info text-dark">{v.unidad}</span>
                      )}
                    </td>
                    <td className="text-center text-capitalize">
                      <span className="badge bg-light text-dark border">{v.tipo_oferta}</span>
                    </td>
                    <td className="text-center text-muted">
                      {new Date(v.fecha).toLocaleString()}
                    </td>
                    <td className="text-center">
                      <Link
                        to={`/ventas/detalle/${v.venta_id}`}
                        className="btn btn-sm btn-outline-primary shadow-sm"
                        title="Ver detalle"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
