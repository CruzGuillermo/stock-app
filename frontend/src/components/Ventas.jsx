import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const styles = {
  container: {
    maxWidth: 480,
    margin: '3rem auto',
    padding: '2rem',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    backgroundColor: '#fff',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 24,
    fontWeight: '700',
    fontSize: '1.8rem',
    userSelect: 'none',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: 6,
    color: '#34495e',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    marginBottom: 20,
    borderRadius: 8,
    border: '1.8px solid #bdc3c7',
    fontSize: '1rem',
    transition: 'border-color 0.25s ease',
    outline: 'none',
  },
  inputFocus: {
    borderColor: '#2980b9',
    boxShadow: '0 0 8px #2980b9aa',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    marginBottom: 20,
    borderRadius: 8,
    border: '1.8px solid #bdc3c7',
    fontSize: '1rem',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    gap: 16,
    marginBottom: 20,
  },
  half: {
    flex: 1,
  },
  totalBox: {
    textAlign: 'center',
    padding: '14px 0',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    fontWeight: '700',
    fontSize: '1.4rem',
    color: '#27ae60',
    userSelect: 'none',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2980b9',
    color: '#fff',
    fontWeight: '700',
    fontSize: '1.1rem',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.3s ease',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
  },
  errorText: {
    color: '#c0392b',
    fontWeight: '600',
    marginBottom: 12,
    userSelect: 'none',
  },
  carritoItem: {
    borderBottom: '1px solid #ddd',
    padding: '8px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carritoLista: {
    marginBottom: 20,
  },
  eliminarBtn: {
    backgroundColor: '#c0392b',
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: 6,
    cursor: 'pointer',
  },
};

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [venta, setVenta] = useState({
    producto_id: '',
    cantidad: 1,
    tipo_oferta: 'litro',
    descuento: 0,
    tipo_descuento: 'porcentaje', // 'porcentaje' o 'monto'
  });
  const [busqueda, setBusqueda] = useState('');
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState({});
  const [placeholderProd, setPlaceholderProd] = useState('Ej: Coca Cola 1.5L');
  const [carrito, setCarrito] = useState([]); // <-- nuevo estado carrito

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await axios.get('/productos');
      setProductos(res.data);

      if (res.data.length > 0) {
        const prodRandom = res.data[Math.floor(Math.random() * res.data.length)];
        if (prodRandom && prodRandom.nombre) {
          setPlaceholderProd(`Ej: ${prodRandom.nombre}`);
        }
      }
    } catch {
      MySwal.fire('Error', 'No se pudieron cargar los productos', 'error');
    }
  };

  // --- Funciones auxiliares existentes (manejarCambio, manejarBusqueda, calcularPrecio, calcularTotales) ---

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    if (name === 'descuento') {
      if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setVenta((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === 'cantidad') {
      if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setVenta((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setVenta((prev) => ({ ...prev, [name]: value }));
    }
  };

  const manejarBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);

    const prod = productos.find(
      (p) => p.nombre.toLowerCase() === valor.toLowerCase()
    );
    if (prod) {
      setProductoEncontrado(prod);
      setVenta((prev) => ({ ...prev, producto_id: prod.id.toString() }));
    } else {
      setProductoEncontrado(null);
      setVenta((prev) => ({ ...prev, producto_id: '' }));
    }
  };

  const calcularPrecio = (producto, tipo) => {
    switch (tipo) {
      case 'medio_litro':
        return {
          unidad: 'medio_litro',
          precio_unitario: producto.precio_0_5l ?? producto.precio_1l / 2,
          factor: 0.5,
        };
      case 'litro':
        return {
          unidad: 'litro',
          precio_unitario: producto.precio_1l,
          factor: 1,
        };
      case '3litros':
        return {
          unidad: 'litro',
          precio_unitario: producto.precio_3l,
          factor: 3,
        };
      case 'unidad':
        return {
          unidad: 'unidad',
          precio_unitario: producto.precio_unidad ?? producto.precio_1l,
          factor: 1,
        };
      case 'kilogramo':
        return {
          unidad: 'kilogramo',
          precio_unitario: producto.precio_kg,
          factor: 1,
        };
      case 'gramo':
        return {
          unidad: 'gramo',
          precio_unitario:
            producto.precio_gramo ?? producto.precio_kg / 1000,
          factor: 1,
        };
      default:
        return { unidad: 'litro', precio_unitario: null, factor: 1 };
    }
  };

  const calcularTotales = () => {
    if (!productoEncontrado) return { total: 0, totalConDescuento: 0 };

    const cantidadNum = parseFloat(venta.cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) return { total: 0, totalConDescuento: 0 };

    const { precio_unitario, factor } = calcularPrecio(
      productoEncontrado,
      venta.tipo_oferta
    );

    if (!precio_unitario || isNaN(precio_unitario)) return { total: 0, totalConDescuento: 0 };

    const total = cantidadNum * precio_unitario;
    const descuentoNum = parseFloat(venta.descuento) || 0;

    let totalConDescuento = total;
    if (venta.tipo_descuento === 'porcentaje') {
      if (descuentoNum >= 0 && descuentoNum <= 100) {
        totalConDescuento = total * (1 - descuentoNum / 100);
      }
    } else if (venta.tipo_descuento === 'monto') {
      if (descuentoNum >= 0 && descuentoNum <= total) {
        totalConDescuento = total - descuentoNum;
      }
    }

    return {
      total,
      totalConDescuento,
    };
  };

  const { total, totalConDescuento } = calcularTotales();

  // --- NUEVO: función para añadir producto actual al carrito ---
  const agregarAlCarrito = () => {
    if (!productoEncontrado) {
      return MySwal.fire('Error', 'Seleccioná un producto válido', 'error');
    }

    const cantidadNum = parseFloat(venta.cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return MySwal.fire('Error', 'La cantidad debe ser mayor a cero', 'warning');
    }

    const descuentoNum = parseFloat(venta.descuento) || 0;
    if (
      (venta.tipo_descuento === 'porcentaje' && (descuentoNum < 0 || descuentoNum > 100)) ||
      (venta.tipo_descuento === 'monto' && (descuentoNum < 0 || descuentoNum > total))
    ) {
      return MySwal.fire('Error', 'Descuento inválido', 'warning');
    }

    const { unidad, precio_unitario, factor } = calcularPrecio(
      productoEncontrado,
      venta.tipo_oferta
    );

    if (!precio_unitario || isNaN(precio_unitario)) {
      return MySwal.fire(
        'Error',
        'Precio no disponible para esta oferta',
        'warning'
      );
    }

    const cantidad_real = cantidadNum * factor;

    // Crear objeto para carrito
    const item = {
      producto_id: productoEncontrado.id,
      nombre: productoEncontrado.nombre,
      cantidad: cantidad_real,
      tipo_oferta: venta.tipo_oferta,
      precio_unitario,
      unidad,
      descuento: descuentoNum,
      tipo_descuento: venta.tipo_descuento,
      subtotal: totalConDescuento,
      cantidadOriginal: cantidadNum,
    };

    setCarrito((prev) => [...prev, item]);

    // Limpiar inputs para nuevo producto
    setVenta({
      producto_id: '',
      cantidad: 1,
      tipo_oferta: 'litro',
      descuento: 0,
      tipo_descuento: 'porcentaje',
    });
    setBusqueda('');
    setProductoEncontrado(null);
  };

  // --- NUEVO: eliminar producto del carrito ---
  const eliminarDelCarrito = (index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  };

  // --- manejar envío total de la venta con múltiples productos ---
  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
      return MySwal.fire('Error', 'El carrito está vacío', 'error');
    }

    const totalVenta = carrito.reduce((acc, item) => acc + item.subtotal, 0);

    const datosVenta = {
      productos: carrito.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        tipo_oferta: item.tipo_oferta,
        precio_unitario: item.precio_unitario,
        unidad: item.unidad,
        descuento: item.descuento,
        tipo_descuento: item.tipo_descuento,
      })),
      total: totalVenta,
    };

    try {
      setLoading(true);
      await axios.post('/ventas', datosVenta);

      await MySwal.fire({
        icon: 'success',
        title: 'Venta registrada',
        html: carrito
          .map(
            (item) =>
              `<p><strong>${item.nombre}</strong> - ${item.cantidadOriginal} ${item.tipo_oferta} - Total: $${item.subtotal.toFixed(
                2
              )}</p>`
          )
          .join('') +
          `<p><strong>Total general a pagar:</strong> <span style="color:#27ae60; font-weight:bold;">$${totalVenta.toFixed(
            2
          )}</span></p>`,
        background: '#f0fff4',
        confirmButtonColor: '#27ae60',
        timer: 5000,
        timerProgressBar: true,
      });

      setCarrito([]);
    } catch (err) {
      console.error(err);
      MySwal.fire('Error', 'Ocurrió un error registrando la venta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (field) => setInputFocus({ [field]: true });
  const handleBlur = () => setInputFocus({});

  // Total general del carrito para mostrar en interfaz
  const totalCarrito = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛒 Nueva Venta con Descuento (Múltiples productos)</h2>

      <form onSubmit={manejarSubmit} autoComplete="off" noValidate>
        <label style={styles.label} htmlFor="busqueda">Buscar producto</label>
        <input
          list="lista-productos"
          id="busqueda"
          name="busqueda"
          style={{
            ...styles.input,
            ...(inputFocus['busqueda'] ? styles.inputFocus : {}),
          }}
          placeholder={placeholderProd}
          value={busqueda}
          onChange={manejarBusqueda}
          onFocus={() => handleFocus('busqueda')}
          onBlur={handleBlur}
          disabled={loading}
          autoFocus
        />
        <datalist id="lista-productos">
          {productos.map((p) => (
            <option key={p.id} value={p.nombre} />
          ))}
        </datalist>

        <div style={styles.row}>
          <div style={styles.half}>
            <label style={styles.label} htmlFor="cantidad">Cantidad</label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              min="0.1"
              step="any"
              style={{
                ...styles.input,
                ...(inputFocus['cantidad'] ? styles.inputFocus : {}),
              }}
              value={venta.cantidad}
              onChange={manejarCambio}
              onFocus={() => handleFocus('cantidad')}
              onBlur={handleBlur}
              disabled={loading}
              required
            />
          </div>

          <div style={styles.half}>
            <label style={styles.label} htmlFor="tipo_oferta">Tipo de oferta</label>
            <select
              id="tipo_oferta"
              name="tipo_oferta"
              style={styles.select}
              value={venta.tipo_oferta}
              onChange={manejarCambio}
              disabled={loading}
            >
              <option value="medio_litro">🥤 Medio litro</option>
              <option value="litro">💧 Litro</option>
              <option value="3litros">🧴 Pack 3L</option>
              <option value="unidad">📦 Unidad</option>
              <option value="kilogramo">⚖️ Kilo</option>
              <option value="gramo">⚖️ Gramo</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.half}>
            <label style={styles.label} htmlFor="tipo_descuento">Tipo de descuento</label>
            <select
              id="tipo_descuento"
              name="tipo_descuento"
              style={styles.select}
              value={venta.tipo_descuento}
              onChange={manejarCambio}
              disabled={loading}
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto">Monto fijo ($)</option>
            </select>
          </div>
          <div style={styles.half}>
            <label style={styles.label} htmlFor="descuento">Descuento</label>
            <input
              type="text"
              id="descuento"
              name="descuento"
              placeholder={
                venta.tipo_descuento === 'porcentaje'
                  ? '0 - 100 %'
                  : 'Monto en $'
              }
              style={{
                ...styles.input,
                ...(inputFocus['descuento'] ? styles.inputFocus : {}),
              }}
              value={venta.descuento}
              onChange={manejarCambio}
              onFocus={() => handleFocus('descuento')}
              onBlur={handleBlur}
              disabled={loading}
            />
          </div>
        </div>

        <div style={styles.totalBox}>
          Total producto: <span>${total.toFixed(2)}</span>
          {venta.descuento > 0 && (
            <>
              {' '}
              | <strong>Total con descuento:</strong>{' '}
              <span>${totalConDescuento.toFixed(2)}</span>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={loading || !productoEncontrado}
          onClick={agregarAlCarrito}
          style={{
            ...styles.button,
            marginBottom: 20,
            ...(loading || !productoEncontrado ? styles.buttonDisabled : {}),
          }}
        >
          ➕ Añadir al carrito
        </button>

        {carrito.length > 0 && (
          <>
            <h3>Carrito</h3>
            <div style={styles.carritoLista}>
              {carrito.map((item, index) => (
                <div key={index} style={styles.carritoItem}>
                  <div>
                    {item.nombre} - {item.cantidadOriginal} {item.tipo_oferta} - $
                    {item.subtotal.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarDelCarrito(index)}
                    style={styles.eliminarBtn}
                    disabled={loading}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            <div style={{ ...styles.totalBox, fontSize: '1.2rem' }}>
              Total general: <strong>${totalCarrito.toFixed(2)}</strong>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading || carrito.length === 0}
          style={{
            ...styles.button,
            ...(loading || carrito.length === 0 ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Procesando...' : '💾 Registrar Venta'}
        </button>
      </form>
    </div>
  );
}
