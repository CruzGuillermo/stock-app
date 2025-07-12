import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OfertasEspeciales() {
  const [ofertas, setOfertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);

  useEffect(() => {
    cargarOfertas();
    cargarProductos();
  }, []);

  const cargarOfertas = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await axios.get('/ofertas');
      setOfertas(res.data);
    } catch {
      setError('Error cargando ofertas');
    } finally {
      setCargando(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await axios.get('/productos');
      setProductos(res.data);
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  };

  const mostrarUnidad = (unidad) => {
    const unidades = {
      litro: 'L',
      medio_litro: '0.5L',
      '3litros': '3L',
      unidad: 'Unid.',
      kilogramo: 'Kg',
      gramo: 'g',
    };
    return unidades[unidad] || unidad;
  };

  const calcularPrecioOriginal = (oferta) => {
    return oferta.items.reduce((total, item) => {
      const producto = productos.find(p => p.id === item.producto_id);
      if (!producto) return total;
      const precios = {
        unidad: producto.precio_unidad,
        litro: producto.precio_1l,
        medio_litro: producto.precio_0_5l,
        '3litros': producto.precio_3l,
        kilogramo: producto.precio_kg,
        gramo: producto.precio_gramo
      };
      const precioUnidad = precios[item.unidad] || 0;
      return total + (precioUnidad * item.cantidad);
    }, 0);
  };

  const calcularDescuento = (oferta) => {
    const original = calcularPrecioOriginal(oferta);
    if (!original || original <= oferta.precio_total) return 0;
    return Math.round((1 - (oferta.precio_total / original)) * 100);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center text-success fw-bold">🎯 Ofertas Especiales</h2>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {cargando ? (
        <p className="text-center text-muted fst-italic">Cargando ofertas...</p>
      ) : ofertas.length === 0 ? (
        <p className="text-center text-muted fst-italic">No hay ofertas disponibles.</p>
      ) : (
        <div className="row gy-4">
          {ofertas.map((oferta) => {
            const descuento = calcularDescuento(oferta);
            const precioOriginal = calcularPrecioOriginal(oferta);

            return (
              <div key={oferta.id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm border-0 h-100 position-relative">
                  {descuento > 0 && (
                    <span className="badge bg-danger position-absolute top-0 end-0 m-2 shadow-sm">
                      -{descuento}% OFF
                    </span>
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-primary fw-bold">{oferta.nombre}</h5>

                    <p className="fs-5 mb-2">
                      <span className="text-success fw-bold me-2">${oferta.precio_total.toFixed(2)}</span>
                      {descuento > 0 && (
                        <span className="text-muted text-decoration-line-through">
                          ${precioOriginal.toFixed(2)}
                        </span>
                      )}
                    </p>

                    <h6 className="mb-2 text-secondary">Incluye:</h6>
                    <ul className="list-group list-group-flush mb-3 flex-grow-1">
                      {oferta.items.map((item, index) => (
                        <li key={index} className="list-group-item border-0 ps-0">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          {item.nombre} x {item.cantidad} {mostrarUnidad(item.unidad)}
                        </li>
                      ))}
                    </ul>

                    <button
                      className="btn btn-outline-success mt-auto align-self-start"
                      onClick={() => setOfertaSeleccionada(oferta)}
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ofertaSeleccionada && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          onClick={() => setOfertaSeleccionada(null)}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease-in-out' }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{ofertaSeleccionada.nombre}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setOfertaSeleccionada(null)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <p>
                  <strong>Precio total:</strong>{' '}
                  <span className="text-success fw-bold">${ofertaSeleccionada.precio_total.toFixed(2)}</span>
                </p>
                {calcularDescuento(ofertaSeleccionada) > 0 && (
                  <p className="text-muted text-decoration-line-through">
                    Precio original: ${calcularPrecioOriginal(ofertaSeleccionada).toFixed(2)}
                  </p>
                )}
                <h6 className="mt-3">Productos incluidos:</h6>
                <ul>
                  {ofertaSeleccionada.items.map((item, i) => (
                    <li key={i}>
                      {item.nombre} x {item.cantidad} {mostrarUnidad(item.unidad)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOfertaSeleccionada(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
