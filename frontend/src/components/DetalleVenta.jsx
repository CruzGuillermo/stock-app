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
    const response = await axios.get(`/ventas/${id}/ticket`, {
      responseType: 'blob', // 👈 para que descargue el archivo correctamente
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-venta-${id}.pdf`;
    link.click();

    window.URL.revokeObjectURL(url); // limpia el objeto blob temporal
  } catch (error) {
    Swal.fire('Error', 'No se pudo descargar el ticket.', 'error');
    console.error('Error descargando ticket:', error);
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
      await Swal.fire({
        title: 'Venta anulada',
        text: 'El stock fue restaurado correctamente.',
        icon: 'success',
      });
      navigate('/ventas/historial');
    } catch {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo anular la venta.',
        icon: 'error',
      });
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
      <div
        className="container mt-5 d-flex justify-content-center align-items-center"
        style={{ height: '200px' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );

  return (
    <div className="container mt-5" style={{ maxWidth: '720px' }}>
      <div className="bg-white p-4 rounded shadow-sm border">
        <div className="mb-4 text-center">
          <h2 className="fw-bold text-primary">
            🧾 Detalle de Venta <span className="text-muted">#{venta.id}</span>
          </h2>
          <p className="text-muted mb-0">
            {new Date(venta.fecha).toLocaleString()}
          </p>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center border p-3 rounded">
            <span className="fw-semibold">💰 Total:</span>
            <span className="fs-4 text-success fw-bold">${venta.total.toFixed(2)}</span>
          </div>
        </div>

        <h5 className="text-secondary mb-3">📦 Productos vendidos:</h5>
        <ul className="list-group mb-4">
          {venta.productos.map((p, i) => (
            <li
              key={i}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="fw-semibold">{p.nombre}</div>
                <small className="text-muted">Cantidad: {p.cantidad}</small>
              </div>
              <span className="badge bg-primary fs-6">${p.precio_unitario.toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="d-flex justify-content-between">
          <Link to="/ventas/historial" className="btn btn-outline-secondary">
            ← Volver al Historial
          </Link>
          <button className="btn btn-outline-primary" onClick={descargarTicket}>
  📥 Descargar Ticket
</button>

          <button className="btn btn-danger" onClick={anularVenta}>
            🗑 Anular Venta
          </button>
        </div>
      </div>
    </div>
  );
}
