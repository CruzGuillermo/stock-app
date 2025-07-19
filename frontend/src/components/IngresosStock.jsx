import { useEffect, useState } from 'react';
import axios from 'axios';

export default function IngresosStock() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({
    producto_id: '',
    unidad: 'litro',
    cantidad: 1,
    precio_unitario: '',
    fecha: new Date().toISOString().slice(0, 10),
    observaciones: '',
  });
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await axios.get('/productos');
      setProductos(res.data);
    } catch {
      setError('Error cargando productos');
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'cantidad' || name === 'precio_unitario'
          ? value === '' ? '' : Number(value)
          : value,
    }));
  };

  const limpiarFormulario = () => {
    setForm({
      producto_id: '',
      unidad: 'litro',
      cantidad: 1,
      precio_unitario: '',
      fecha: new Date().toISOString().slice(0, 10),
      observaciones: '',
    });
    setMensaje(null);
    setError(null);
    setBusqueda('');
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!form.producto_id) return setError('Debe seleccionar un producto');
    if (form.cantidad <= 0) return setError('La cantidad debe ser mayor a 0');
    if (form.precio_unitario === '' || form.precio_unitario < 0)
      return setError('Ingrese un precio unitario válido');
    if (!form.unidad) return setError('Debe seleccionar una unidad');

    try {
      await axios.post('/ingresos-stock', form);
      setMensaje('✅ Ingreso de stock registrado con éxito');
      limpiarFormulario();
    } catch {
      setError('❌ Error registrando ingreso');
    }
  };

  const productosFiltrados = productos.filter((p) =>
    (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container mt-4 px-2">
      <h2 className="mb-4 text-center text-primary fw-bold">📦 Ingreso de Stock</h2>

      {/* Loading spinner */}
      {cargando && (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!cargando && (
        <>
          {mensaje && (
            <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
              {mensaje}
              <button type="button" className="btn-close" onClick={() => setMensaje(null)} />
            </div>
          )}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)} />
            </div>
          )}

          <form onSubmit={manejarSubmit} noValidate className="card p-4 shadow-sm border-0">
            {/* Selector de producto */}
            <div className="mb-3">
              <label htmlFor="producto_id" className="form-label fw-semibold">
                Producto <span className="text-danger">*</span>
              </label>
              <select
                id="producto_id"
                name="producto_id"
                className="form-select"
                value={form.producto_id}
                onChange={manejarCambio}
                required
              >
                <option value="">Selecciona un producto...</option>
                {productosFiltrados.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Unidad y cantidad */}
            <div className="row row-cols-1 row-cols-sm-2 g-3 mb-3">
              <div className="col">
                <label htmlFor="unidad" className="form-label fw-semibold">
                  Unidad <span className="text-danger">*</span>
                </label>
                <select
                  id="unidad"
                  name="unidad"
                  className="form-select"
                  value={form.unidad}
                  onChange={manejarCambio}
                  required
                >
                  <option value="medio_litro">Medio Litro</option>
                  <option value="litro">Litro</option>
                  <option value="3litros">3 Litros</option>
                  <option value="unidad">Unidad</option>
                  <option value="kilogramo">Kilogramo</option>
                  <option value="gramo">Gramo</option>
                </select>
              </div>
              <div className="col">
                <label htmlFor="cantidad" className="form-label fw-semibold">
                  Cantidad <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="cantidad"
                  name="cantidad"
                  min="0.01"
                  step="any"
                  className="form-control"
                  value={form.cantidad}
                  onChange={manejarCambio}
                  required
                />
              </div>
            </div>

            {/* Precio y fecha */}
            <div className="row row-cols-1 row-cols-sm-2 g-3 mb-3">
              <div className="col">
                <label htmlFor="precio_unitario" className="form-label fw-semibold">
                  Precio Unitario <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="precio_unitario"
                  name="precio_unitario"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 123.45"
                  className="form-control"
                  value={form.precio_unitario}
                  onChange={manejarCambio}
                  required
                />
              </div>
              <div className="col">
                <label htmlFor="fecha" className="form-label fw-semibold">
                  Fecha <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  className="form-control"
                  value={form.fecha}
                  onChange={manejarCambio}
                  required
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="mb-4">
              <label htmlFor="observaciones" className="form-label fw-semibold">Observaciones</label>
              <textarea
                id="observaciones"
                name="observaciones"
                className="form-control"
                placeholder="Opcional"
                value={form.observaciones}
                onChange={manejarCambio}
                rows="3"
              />
            </div>

            {/* Botones */}
            <div className="d-flex flex-column flex-sm-row gap-2">
              <button type="submit" className="btn btn-primary fw-semibold w-100">
                ✅ Registrar Ingreso
              </button>
              <button type="button" className="btn btn-outline-secondary fw-semibold w-100" onClick={limpiarFormulario}>
                Limpiar
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
