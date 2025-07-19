import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import VerPrecio from './VerPrecio';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    categoria: '',
    stock: 0,
    unidad: 'litro',
    precio_0_5l: 0,
    precio_1l: 0,
    precio_3l: 0,
    precio_unidad: 0,
    precio_kg: 0,
    precio_gramo: 0,
    stock_minimo: 0,
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true); // NUEVO

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setCargando(true); // INICIO carga
    try {
      const res = await axios.get('/productos');
      setProductos(res.data);
      setError(null);
    } catch {
      setError('Error cargando productos');
    } finally {
      setCargando(false); // FIN carga
    }
  };

  const manejarCambio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setEditId(null);
    setForm({
      nombre: '',
      categoria: '',
      stock: 0,
      unidad: 'litro',
      precio_0_5l: 0,
      precio_1l: 0,
      precio_3l: 0,
      precio_unidad: 0,
      precio_kg: 0,
      precio_gramo: 0,
      stock_minimo: 0,
    });
    setError(null);
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      ...form,
      stock: Number(form.stock || 0),
      precio_0_5l: Number(form.precio_0_5l || 0),
      precio_1l: Number(form.precio_1l || 0),
      precio_3l: Number(form.precio_3l || 0),
      precio_unidad: Number(form.precio_unidad || 0),
      precio_kg: Number(form.precio_kg || 0),
      precio_gramo: Number(form.precio_gramo || 0),
      stock_minimo: Number(form.stock_minimo || 0),
    };

    try {
      if (editId) {
        await axios.put(`/productos/${editId}`, formData);
      } else {
        await axios.post('/productos', formData);
      }
      limpiarFormulario();
      cargarProductos();
    } catch {
      setError('Error guardando producto');
    }
  };

  const editarProducto = (producto) => {
    setForm(producto);
    setEditId(producto.id);
    setError(null);
  };

  const eliminarProducto = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`/productos/${id}`);
        cargarProductos();
      } catch {
        setError('Error eliminando producto');
      }
    }
  };

  const mostrarUnidad = (unidad) => {
    const unidades = {
      litro: 'Litro',
      medio_litro: 'Medio Litro',
      '3litros': '3 Litros',
      unidad: 'Unidad',
      kilogramo: 'Kilogramo',
      gramo: 'Gramo',
    };
    return unidades[unidad] || unidad;
  };

  const productosFiltrados = productos.filter((p) =>
    (p.nombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4 px-3 px-md-5">
      <h2 className="text-primary fw-bold mb-4 text-center">📋 Gestión de Productos</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {cargando ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Input de búsqueda */}
          <div className="mb-4 d-flex justify-content-center">
            <input
              type="text"
              className="form-control form-control-lg shadow-sm"
              placeholder="Buscar por nombre o categoría..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={{ maxWidth: '400px' }}
            />
          </div>

          {/* Tabla responsive sin scroll lateral ocultando columnas en móvil */}
          <div className="table-responsive mb-5 shadow-sm rounded">
            <table className="table table-hover align-middle bg-white table-bordered rounded-3 overflow-hidden">
              <thead className="table-dark sticky-top">
                <tr className="text-center">
                  <th>Nombre</th>
                  <th className="d-none d-sm-table-cell">Categoría</th>
                  <th>Stock</th>
                  <th className="d-none d-md-table-cell">Unidad</th>
                  <th className="d-none d-lg-table-cell">0.5L</th>
                  <th className="d-none d-lg-table-cell">1L</th>
                  <th className="d-none d-lg-table-cell">3L</th>
                  <th className="d-none d-md-table-cell">Unidad</th>
                  <th className="d-none d-xl-table-cell">Kg</th>
                  <th className="d-none d-xl-table-cell">Gramo</th>
                  <th className="d-none d-sm-table-cell">Mínimo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p) => {
                  const stockReal = Number(p.stock);
                  const stockMin = Number(p.stock_minimo);
                  const stockBajo = stockReal <= stockMin;

                  return (
                    <tr
                      key={p.id}
                      className={`text-center ${stockBajo ? 'table-warning' : ''}`}
                      title={stockBajo ? 'Stock bajo ⚠️' : ''}
                    >
                      <td className="fw-semibold">
                        <VerPrecio producto={p} />
                      </td>

                      <td className="d-none d-sm-table-cell">{p.categoria}</td>
                      <td className={stockBajo ? 'text-danger fw-bold' : ''}>{stockReal}</td>
                      <td className="d-none d-md-table-cell">{mostrarUnidad(p.unidad)}</td>
                      <td className="d-none d-lg-table-cell">${(p.precio_0_5l ?? 0).toFixed(2)}</td>
                      <td className="d-none d-lg-table-cell">${(p.precio_1l ?? 0).toFixed(2)}</td>
                      <td className="d-none d-lg-table-cell">${(p.precio_3l ?? 0).toFixed(2)}</td>
                      <td className="d-none d-md-table-cell">${(p.precio_unidad ?? 0).toFixed(2)}</td>
                      <td className="d-none d-xl-table-cell">${(p.precio_kg ?? 0).toFixed(2)}</td>
                      <td className="d-none d-xl-table-cell">${(p.precio_gramo ?? 0).toFixed(2)}</td>
                      <td className="d-none d-sm-table-cell">{stockMin}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          <button
                            onClick={() => editarProducto(p)}
                            className="btn btn-warning btn-sm"
                            style={{ minWidth: '100px' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarProducto(p.id)}
                            className="btn btn-danger btn-sm"
                            style={{ minWidth: '100px' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Formulario */}
          <div className="card shadow-sm p-4 mb-5">
            <h5 className="mb-3 text-center">{editId ? '✏️ Editar Producto' : '➕ Crear Producto'}</h5>
            <form onSubmit={manejarSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={form.nombre}
                    onChange={manejarCambio}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Categoría</label>
                  <input
                    type="text"
                    name="categoria"
                    className="form-control"
                    value={form.categoria}
                    onChange={manejarCambio}
                    required
                  />
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-control"
                    value={form.stock}
                    onChange={manejarCambio}
                    min="0"
                  />
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label">Unidad</label>
                  <select
                    name="unidad"
                    className="form-select"
                    value={form.unidad}
                    onChange={manejarCambio}
                    required
                  >
                    <option value="litro">Litro</option>
                    <option value="medio_litro">Medio Litro</option>
                    <option value="3litros">3 Litros</option>
                    <option value="unidad">Unidad</option>
                    <option value="kilogramo">Kilogramo</option>
                    <option value="gramo">Gramo</option>
                  </select>
                </div>

                {/* Precios */}
                {[
                  { label: '0.5L', name: 'precio_0_5l' },
                  { label: '1L', name: 'precio_1l' },
                  { label: '3L', name: 'precio_3l' },
                  { label: 'Unidad', name: 'precio_unidad' },
                  { label: 'Kg', name: 'precio_kg' },
                  { label: 'Gramo', name: 'precio_gramo' },
                  { label: 'Stock mínimo', name: 'stock_minimo' },
                ].map(({ label, name }) => (
                  <div
                    key={name}
                    className={name === 'stock_minimo' ? 'col-12 col-md-3' : 'col-6 col-md-3'}
                  >
                    <label className="form-label">{name === 'stock_minimo' ? 'Stock mínimo' : `Precio ${label}`}</label>
                    <input
                      type="number"
                      name={name}
                      className="form-control"
                      value={form[name]}
                      onChange={manejarCambio}
                      min="0"
                      step={name === 'stock_minimo' ? '1' : '0.01'}
                      required={name === 'stock_minimo'}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1 flex-md-grow-0"
                  style={{ minWidth: '120px' }}
                >
                  {editId ? 'Actualizar' : 'Crear'}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="btn btn-secondary flex-grow-1 flex-md-grow-0"
                    onClick={limpiarFormulario}
                    style={{ minWidth: '120px' }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
