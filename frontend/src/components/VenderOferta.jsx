import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function VenderOferta() {
  const [ofertas, setOfertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarOfertas();
    cargarProductos();
  }, []);

  const cargarOfertas = async () => {
    try {
      const res = await axios.get('/ofertas');
      setOfertas(res.data);
    } catch (err) {
      console.error(err);
      setError('Error cargando ofertas especiales');
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await axios.get('/productos');
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const venderOferta = async (oferta) => {
    for (const item of oferta.items) {
      const cantidadNum = Number(item.cantidad);
      if (!cantidadNum || isNaN(cantidadNum) || cantidadNum <= 0) {
        return MySwal.fire('❌ Error', `Cantidad inválida para producto ID ${item.producto_id}`, 'error');
      }
      if (!item.unidad || typeof item.unidad !== 'string') {
        return MySwal.fire('❌ Error', `Unidad inválida para producto ID ${item.producto_id}`, 'error');
      }
    }

    const confirmacion = await MySwal.fire({
      title: '¿Confirmar venta?',
      html: `
        <strong>${oferta.nombre}</strong><br />
        Productos incluidos:<br />
        <ul style="text-align:left; padding-left: 1.2em; margin-top: 0.5em;">
          ${oferta.items.map(i => `<li>${i.nombre} x ${i.cantidad} ${i.unidad || ''}</li>`).join('')}
        </ul>
        <br /><strong>Total: <span style="color:#198754;">$${oferta.precio_total}</span></strong>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-check-circle"></i> Sí, vender',
      cancelButtonText: '<i class="bi bi-x-circle"></i> Cancelar',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#dc3545',
      customClass: { popup: 'shadow-lg rounded-3', title: 'fw-bold' }
    });

    if (!confirmacion.isConfirmed) return;

    const datosVenta = {
      productos: oferta.items.map(item => ({
        producto_id: item.producto_id,
        cantidad: Number(item.cantidad),
        unidad: item.unidad || 'unidad',
        precio_unitario: parseFloat((oferta.precio_total / oferta.items.length).toFixed(2))
      })),
      total: oferta.precio_total
    };

    try {
      await axios.post('/ventas', datosVenta);
      await MySwal.fire({
        icon: 'success',
        title: '✅ Venta realizada',
        html: `<p>Se vendió correctamente la oferta <strong>${oferta.nombre}</strong>.</p>`,
        background: '#e6f4ea',
        confirmButtonColor: '#198754',
        timer: 3500,
        timerProgressBar: true,
        customClass: { popup: 'shadow-lg rounded-3' }
      });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Error al registrar la venta';
      MySwal.fire('❌ Error', msg, 'error');
    }
  };

  const eliminarOferta = async (id) => {
    const confirm = await MySwal.fire({
      title: '¿Eliminar oferta?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Eliminar',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`/ofertas/${id}`);
      await cargarOfertas();
      MySwal.fire('🗑️ Eliminado', 'La oferta fue eliminada.', 'success');
    } catch (err) {
      console.error(err);
      MySwal.fire('Error', 'No se pudo eliminar la oferta', 'error');
    }
  };

  const abrirFormulario = async (modo = 'crear', oferta = null) => {
    const formHtml = document.createElement('div');

    let nombre = oferta?.nombre || '';
    let precio_total = oferta?.precio_total || '';
    let itemsSeleccionados = oferta?.items ? [...oferta.items] : [];

    const renderListaItems = () => {
      const listaItems = formHtml.querySelector('#listaItems');
      if (!listaItems) return;
      listaItems.innerHTML = itemsSeleccionados.map((item, idx) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${productos.find(p => p.id === item.producto_id)?.nombre || item.nombre} x ${item.cantidad} ${item.unidad || ''}
          <button data-idx="${idx}" class="btn btn-sm btn-danger quitar-item">Quitar</button>
        </li>
      `).join('');
    };

    formHtml.innerHTML = `
      <div class="mb-3">
        <label class="form-label">Nombre de la Oferta</label>
        <input type="text" id="nombreOferta" class="form-control" value="${nombre}">
      </div>
      <div class="mb-3">
        <label class="form-label">Precio Total</label>
        <input type="number" id="precioTotal" class="form-control" value="${precio_total}">
      </div>
      <div class="mb-3">
        <label class="form-label">Agregar Producto</label>
        <select id="productoSelect" class="form-select">
          <option value="">Seleccionar producto</option>
          ${productos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
        </select>
        <input type="number" id="cantidadInput" placeholder="Cantidad" class="form-control mt-2" min="0.1" step="any">
        <select id="unidadSelect" class="form-select mt-2">
          <option value="unidad">Unidad</option>
          <option value="kilogramo">Kilogramo (kg)</option>
          <option value="gramo">Gramo (g)</option>
          <option value="litro">Litro (L)</option>
          <option value="medio_litro">Medio Litro (0.5L)</option>
          <option value="3litros">3 Litros</option>
        </select>
        <button type="button" class="btn btn-primary mt-2" id="agregarItem">Agregar</button>
      </div>
      <div class="mt-3">
        <label class="form-label">Productos Agregados</label>
        <ul id="listaItems" class="list-group" style="max-height: 180px; overflow-y: auto;"></ul>
      </div>
    `;

    renderListaItems();

    const swalForm = await MySwal.fire({
      title: modo === 'crear' ? 'Nueva Oferta' : 'Editar Oferta',
      html: formHtml,
      showCancelButton: true,
      focusConfirm: false,
      width: '90%',
      didOpen: () => {
        const productoSelect = formHtml.querySelector('#productoSelect');
        const cantidadInput = formHtml.querySelector('#cantidadInput');
        const unidadSelect = formHtml.querySelector('#unidadSelect');
        const agregarBtn = formHtml.querySelector('#agregarItem');
        const listaItems = formHtml.querySelector('#listaItems');

        agregarBtn.addEventListener('click', () => {
          const productoId = parseInt(productoSelect.value);
          const cantidad = parseFloat(cantidadInput.value);
          const unidad = unidadSelect.value;

          if (!productoId || !cantidad || cantidad <= 0) return;

          const yaExiste = itemsSeleccionados.some(i => i.producto_id === productoId && i.unidad === unidad);
          if (yaExiste) {
            MySwal.showValidationMessage('El producto con esa unidad ya fue agregado.');
            return;
          }

          itemsSeleccionados.push({ producto_id: productoId, cantidad, unidad });
          renderListaItems();

          productoSelect.value = '';
          cantidadInput.value = '';
          unidadSelect.value = 'unidad';
        });

        listaItems.addEventListener('click', (e) => {
          if (e.target.classList.contains('quitar-item')) {
            const idx = parseInt(e.target.dataset.idx);
            itemsSeleccionados.splice(idx, 1);
            renderListaItems();
          }
        });
      },
      preConfirm: () => {
        const nombreOferta = formHtml.querySelector('#nombreOferta').value.trim();
        const precioTotal = parseFloat(formHtml.querySelector('#precioTotal').value);

        if (!nombreOferta || isNaN(precioTotal) || itemsSeleccionados.length === 0) {
          MySwal.showValidationMessage('Todos los campos son obligatorios y debe haber al menos un producto.');
          return false;
        }

        return { nombre: nombreOferta, precio_total: precioTotal, items: itemsSeleccionados };
      },
      customClass: { popup: 'shadow-lg rounded-3' }
    });

    if (!swalForm.isConfirmed) return;

    try {
      if (modo === 'crear') {
        await axios.post('/ofertas', swalForm.value);
      } else {
        await axios.put(`/ofertas/${oferta.id}`, swalForm.value);
      }

      await cargarOfertas();
      MySwal.fire('✅ Guardado', 'La oferta fue procesada correctamente', 'success');
    } catch (err) {
      console.error(err);
      MySwal.fire('❌ Error', 'No se pudo guardar la oferta', 'error');
    }
  };

  const calcularDescuento = (oferta) => {
    const precioOriginal = oferta.items.reduce((acc, item) => {
      const producto = productos.find(p => p.id === item.producto_id);
      return acc + (producto?.precio_venta || 0) * item.cantidad;
    }, 0);
    if (!precioOriginal || precioOriginal <= oferta.precio_total) return 0;
    return Math.round((1 - (oferta.precio_total / precioOriginal)) * 100);
  };

  const tieneFaltantes = (oferta) => {
    return oferta.items.some(item => {
      const producto = productos.find(p => p.id === item.producto_id);
      return producto?.stock <= 0;
    });
  };

  return (
    <div className="container mt-5 px-3 px-md-0">
      <h2 className="mb-4 text-center text-primary fw-bold">🎯 Ofertas Especiales</h2>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: '400px', minWidth: '200px' }}
          placeholder="🔍 Buscar oferta por nombre..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          aria-label="Buscar oferta por nombre"
        />
        <button
          className="btn btn-primary btn-lg flex-shrink-0"
          onClick={() => abrirFormulario('crear')}
          style={{ minWidth: '180px' }}
          type="button"
        >
          ➕ Nueva Oferta
        </button>
      </div>

      {error && <div className="alert alert-danger shadow-sm">{error}</div>}

      <div className="row g-3">
        {ofertas.length === 0 && (
          <p className="text-center text-muted w-100">No hay ofertas disponibles.</p>
        )}

        {ofertas
          .filter(oferta => oferta.nombre.toLowerCase().includes(filtro.toLowerCase()))
          .map(oferta => {
            const descuento = calcularDescuento(oferta);
            const faltantes = tieneFaltantes(oferta);

            return (
              <div key={oferta.id} className="col-12 col-sm-6 col-lg-4 d-flex">
                <div className="card shadow-sm flex-fill position-relative">
                  {descuento > 0 && (
                    <span className="badge bg-success position-absolute top-0 end-0 m-2">
                      {descuento}% OFF
                    </span>
                  )}
                  {faltantes && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                      Sin stock
                    </span>
                  )}

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold text-primary">{oferta.nombre}</h5>

                    <ul
                      className="list-unstyled mb-3 flex-grow-1"
                      style={{ maxHeight: '140px', overflowY: 'auto', paddingRight: '8px' }}
                      aria-label={`Productos incluidos en oferta ${oferta.nombre}`}
                    >
                      {oferta.items.map(item => (
                        <li
                          key={item.producto_id}
                          className="d-flex justify-content-between border-bottom py-1"
                        >
                          <span>
                            <i className="bi bi-basket3 me-2 text-success" aria-hidden="true" />
                            {item.nombre}
                          </span>
                          <span className="fw-semibold">
                            {item.cantidad} {item.unidad || ''}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <span className="fs-5 fw-bold text-success">${oferta.precio_total}</span>
                      <div className="btn-group" role="group" aria-label="Acciones oferta">
                        <button
                          className="btn btn-success btn-sm"
                          title="Vender"
                          onClick={() => venderOferta(oferta)}
                          type="button"
                        >
                          <i className="bi bi-cash-stack" aria-hidden="true"></i>
                          <span className="visually-hidden">Vender</span>
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          title="Editar"
                          onClick={() => abrirFormulario('editar', oferta)}
                          type="button"
                        >
                          <i className="bi bi-pencil-square" aria-hidden="true"></i>
                          <span className="visually-hidden">Editar</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Eliminar"
                          onClick={() => eliminarOferta(oferta.id)}
                          type="button"
                        >
                          <i className="bi bi-trash" aria-hidden="true"></i>
                          <span className="visually-hidden">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
