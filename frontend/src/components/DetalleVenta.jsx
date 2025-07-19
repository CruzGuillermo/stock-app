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

  const formatearMoneda = (valor) => `$${valor.toFixed(2)}`;

  const calcularSubtotal = (producto) => {
  // Si necesitas lógica especial para ciertos productos, hazlo más explícito
  const esOfertaEspecial = producto.cantidad === '3';
  return esOfertaEspecial
    ? producto.precio_unitario - producto.descuento
    : (producto.precio_unitario * producto.cantidad) - producto.descuento;
};


  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center fw-semibold shadow-sm">{error}</div>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="container mt-5 d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4 px-2">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white text-center">
          <h5 className="fw-bold mb-1">🧾 Venta #{venta.id}</h5>
          <small>{new Date(venta.fecha).toLocaleString()}</small>
        </div>

        <div className="card-body">
          <div className="mb-3 p-3 bg-light rounded border text-center">
            <span className="d-block fw-semibold text-muted">Total</span>
            <span className="fs-3 text-success fw-bold">{formatearMoneda(venta.total)}</span>
          </div>

          <h6 className="text-secondary mb-3">📦 Productos vendidos:</h6>

          {Array.isArray(venta.productos) && venta.productos.map((p, i) => (
            <div key={i} className="border rounded p-3 mb-3 shadow-sm bg-white">
              <h6 className="fw-bold mb-2">{p.nombre}</h6>
              <div className="mb-1"><strong>Cantidad:</strong> {p.cantidad} {p.unidad}</div>
              <div className="mb-1"><strong>Precio Unitario:</strong> {formatearMoneda(p.precio_unitario)}</div>
              <div className="mb-1 text-danger"><strong>Descuento:</strong> -{formatearMoneda(p.descuento)}</div>
              <div className="fw-semibold mt-2 text-end">
              </div>
            </div>
          ))}

          {venta.comentario && (
            <div className="alert alert-info mt-4 fst-italic">
              <strong>Comentario:</strong> {venta.comentario}
            </div>
          )}
        </div>

        <div className="card-footer d-flex flex-column gap-2">
          <Link to="/ventas/historial" className="btn btn-outline-secondary w-100">
            ← Volver al Historial
          </Link>

          <button className="btn btn-outline-primary w-100" onClick={descargarTicket}>
            📥 Descargar Ticket
          </button>

          {venta.fiado && !venta.pagada && (
            <button className="btn btn-success w-100" onClick={marcarComoPagada}>
              💵 Marcar como pagada
            </button>
          )}

          <button className="btn btn-danger w-100" onClick={anularVenta}>
            🗑 Anular Venta
          </button>
        </div>
      </div>
    </div>
  );
}
