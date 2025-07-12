import { useEffect, useState } from 'react';
import axios from 'axios';
import TopProductos from './TopProductos';

export default function Stock() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarStock();
  }, []);

  const cargarStock = async () => {
    try {
      const res = await axios.get('/productos/stock');
      setProductos(res.data);
    } catch (error) {
      console.error('Error cargando stock:', error);
    }
  };

  const productosFiltrados = productos.filter(
    (p) =>
      (p.nombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (p.categoria || '').toLowerCase().includes(filtro.toLowerCase())
  );

  const mostrarUnidad = (unidad, abreviado = false) => {
    const unidades = {
      litro: abreviado ? 'L' : 'Litro',
      medio_litro: abreviado ? '0.5L' : 'Medio Litro',
      '3litros': abreviado ? '3L' : '3 Litros',
      unidad: abreviado ? 'Unid.' : 'Unidad',
      kilogramo: abreviado ? 'Kg' : 'Kilogramo',
      gramo: abreviado ? 'g' : 'Gramo',
    };
    return unidades[unidad] || unidad;
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">📦 Stock de Productos</h2>
        <p className="text-muted">Control de inventario en tiempo real</p>
      </div>

      {/* Filtro de búsqueda */}
      <div className="mb-4 d-flex justify-content-center">
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-light">
              <i className="bi bi-search" />
            </span>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Buscar por nombre o categoría"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              aria-label="Buscar productos por nombre o categoría"
            />
          </div>
        </div>
      </div>

      {/* Tabla responsive con columnas ocultas en móvil */}
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle bg-white">
          <thead className="table-primary">
            <tr className="text-center">
              <th>Producto</th>
              <th className="d-none d-sm-table-cell">Categoría</th>
              <th>Stock</th>
              <th className="d-none d-sm-table-cell">Unidad</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              productosFiltrados.map((p) => {
                const stockReal = Number(p.stock);
                const stockMin = Number(p.stock_minimo);
                const stockBajo = stockReal <= stockMin;

                return (
                  <tr
                    key={p.id}
                    className="text-center"
                    title={stockBajo ? 'Stock bajo ⚠️' : ''}
                  >
                    <td className="fw-semibold">{p.nombre}</td>
                    <td className="d-none d-sm-table-cell">{p.categoria}</td>
                    <td>
                      <span
                        className={`badge fs-6 px-3 py-2 ${
                          stockBajo ? 'bg-danger' : 'bg-success'
                        }`}
                        style={{ fontWeight: '700' }}
                      >
                        {stockReal} {mostrarUnidad(p.unidad, true)}
                      </span>
                    </td>
                    <td className="d-none d-sm-table-cell">{mostrarUnidad(p.unidad)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Componente extra opcional */}
      <div className="mt-5">
        <TopProductos />
      </div>
    </div>
  );
}
