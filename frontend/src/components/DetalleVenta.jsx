import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function DetalleVenta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) cargarDetalle();
  }, [id]);

  const descargarTicket = async () => {
    try {
      const response = await axios.get(`/ventas/${id}/ticket`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-venta-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      Swal.fire('Error', 'No se pudo descargar el ticket.', 'error');
    }
  };

  const cargarDetalle = async () => {
    try {
      const res = await axios.get(`/ventas/detalle/${id}`);
      const venta = {
        ...res.data,
        total: Number(res.data.total),
        productos: res.data.productos.map((p) => ({
          ...p,
          precio_unitario: Number(p.precio_unitario),
          cantidad: Number(p.cantidad),
          descuento: Number(p.descuento) || 0,
        })),
      };
      setVenta(venta);
    } catch {
      setError('Error cargando detalle de venta');
    }
  };

  const anularVenta = async () => {
    const confirmacion = await Swal.fire({
      title: '¿Anular venta?',
      text: 'Esto restaurará el stock de los productos vendidos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.delete(`/ventas/${id}`);
      await Swal.fire('Venta anulada', 'El stock fue restaurado correctamente.', 'success');
      navigate('/ventas/historial');
    } catch {
      Swal.fire('Error', 'No se pudo anular la venta.', 'error');
    }
  };

  const marcarComoPagada = async () => {
    try {
      await axios.patch(`/ventas/${id}/pagar`);
      Swal.fire('Éxito', 'Venta fiada marcada como pagada.', 'success');
      cargarDetalle();
    } catch {
      Swal.fire('Error', 'No se pudo marcar la venta como pagada.', 'error');
    }
  };

  if (error)
    return (
      <div className="container mt-4">
        <div className="alert alert-danger shadow-sm text-center fw-semibold">{error}</div>
      </div>
    );

  if (!venta)
    return (
      <div className="container mt-5 d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );

  return (
    <div className="container mt-5" style={{ maxWidth: '720px' }}>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white text-center">
          <h2 className="fw-bold mb-0">
            🧾 Detalle de Venta <span className="text-light">#{venta.id}</span>
          </h2>
          <small>{new Date(venta.fecha).toLocaleString()}</small>
        </div>

        <div className="card-body">
          <div className="mb-4 p-3 bg-light rounded d-flex justify-content-between align-items-center border">
            <span className="fw-semibold fs-5">💰 Total:</span>
            <span className="fs-3 text-success fw-bold">${venta.total.toFixed(2)}</span>
          </div>

          <h5 className="text-secondary mb-3">📦 Productos vendidos:</h5>
          <table className="table table-hover table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th className="text-center">Cantidad</th>
                <th className="text-end">Precio Unitario</th>
                <th className="text-end">Descuento</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.productos.map((p, i) => {
                const subtotal = (p.precio_unitario * p.cantidad) - p.descuento;
                return (
                  <tr key={i} className="align-middle">
                    <td>{p.nombre}</td>
                    <td className="text-center">{p.cantidad} {p.unidad}</td>
                    <td className="text-end">${p.precio_unitario.toFixed(2)}</td>
                    <td className="text-end text-danger">-${p.descuento.toFixed(2)}</td>
                    <td className="text-end fw-semibold">${subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {venta.comentario && (
            <div className="alert alert-info mt-4" style={{ fontStyle: 'italic' }}>
              <strong>Comentario:</strong> {venta.comentario}
            </div>
          )}
        </div>

        <div className="card-footer d-flex flex-wrap justify-content-between gap-2">
          <Link to="/ventas/historial" className="btn btn-outline-secondary flex-grow-1 flex-md-grow-0">
            ← Volver al Historial
          </Link>

          <button
            className="btn btn-outline-primary flex-grow-1 flex-md-grow-0"
            onClick={descargarTicket}
          >
            📥 Descargar Ticket
          </button>

          {venta.fiado && !venta.pagada && (
            <button className="btn btn-success flex-grow-1 flex-md-grow-0" onClick={marcarComoPagada}>
              💵 Marcar como pagada
            </button>
          )}

          <button
            className="btn btn-danger flex-grow-1 flex-md-grow-0"
            onClick={anularVenta}
          >
            🗑 Anular Venta
          </button>
        </div>
      </div>
    </div>
  );
}
