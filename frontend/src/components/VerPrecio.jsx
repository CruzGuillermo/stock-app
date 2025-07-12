// src/components/VerPrecio.jsx
import Swal from 'sweetalert2';

export default function VerPrecio({ producto }) {
  const precios = [
    { etiqueta: '0.5L', valor: producto.precio_0_5l },
    { etiqueta: '1L', valor: producto.precio_1l },
    { etiqueta: '3L', valor: producto.precio_3l },
    { etiqueta: 'Unidad', valor: producto.precio_unidad },
    { etiqueta: 'Kg', valor: producto.precio_kg },
    { etiqueta: 'Gramo', valor: producto.precio_gramo },
  ];

  const preciosValidos = precios.filter(p => Number(p.valor) > 0);

  if (preciosValidos.length === 0) return null;

  const mostrarDetalle = () => {
    Swal.fire({
      title: `💰 Precios de "${producto.nombre}"`,
      html: `
        <ul class="list-group text-start mt-3">
          ${preciosValidos.map(p => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              ${p.etiqueta}
              <span class="fw-bold text-success">$${Number(p.valor).toFixed(2)}</span>
            </li>
          `).join('')}
        </ul>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#0d6efd',
      customClass: {
        popup: 'shadow rounded',
        title: 'fw-bold'
      }
    });
  };

  return (
    <button
      onClick={mostrarDetalle}
      className="btn btn-link p-0 text-decoration-none text-primary fw-semibold"
      style={{ cursor: 'pointer' }}
      title="Ver precios"
    >
      {producto.nombre}
    </button>
  );
}
