const express = require('express');
const db = require('../db/database');
const router = express.Router();
const moment = require('moment-timezone');

function convertirACantidadBase(cantidad, unidad) {
  switch (unidad) {
    case 'medio_litro': return cantidad * 0.5;
    case 'litro': return cantidad * 1;
    case '3litros': return cantidad * 3;
    case 'unidad': return cantidad * 1;
    case 'kilogramo': return cantidad * 1;
    case 'gramo': return cantidad * 0.001;
    default: return cantidad;
  }
}

async function verificarStock(productos) {
  const errores = [];

  for (const { producto_id, cantidad, unidad } of productos) {
    if (typeof cantidad !== 'number' || isNaN(cantidad) || cantidad <= 0) {
      errores.push(`Cantidad inválida para producto ID ${producto_id}`);
      continue;
    }
    if (!unidad || typeof unidad !== 'string') {
      errores.push(`Unidad inválida para producto ID ${producto_id}`);
      continue;
    }

    const res = await db.query('SELECT stock, nombre FROM productos WHERE id = $1', [producto_id]);
    if (res.rowCount === 0) {
      errores.push(`Producto ID ${producto_id} no existe.`);
      continue;
    }
    const row = res.rows[0];
    const cantidadConvertida = convertirACantidadBase(cantidad, unidad);

    if (row.stock < cantidadConvertida) {
      errores.push(`Stock insuficiente para ${row.nombre}. Disponible: ${row.stock}, requerido: ${cantidadConvertida}.`);
    }
  }

  return errores;
}

router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT v.id AS venta_id, v.fecha, p.nombre AS nombre_producto,
             dv.cantidad, dv.tipo_oferta, dv.unidad
      FROM ventas v
      JOIN detalle_ventas dv ON dv.venta_id = v.id
      JOIN productos p ON dv.producto_id = p.id
      ORDER BY v.fecha DESC
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Error consultando ventas:', error);
    res.status(500).json({ error: 'Error al consultar ventas' });
  }
});

router.post('/', async (req, res) => {
  const { productos, total } = req.body;

  if (!Array.isArray(productos) || productos.length === 0)
    return res.status(400).json({ error: 'Debe enviar productos para registrar la venta.' });

  if (typeof total !== 'number' || isNaN(total))
    return res.status(400).json({ error: 'Total inválido' });

  for (const prod of productos) {
    if (typeof prod.cantidad !== 'number' || isNaN(prod.cantidad) || prod.cantidad <= 0) {
      return res.status(400).json({ error: `Cantidad inválida para producto ID ${prod.producto_id}` });
    }
    if (!prod.unidad || typeof prod.unidad !== 'string') {
      return res.status(400).json({ error: `Unidad inválida para producto ID ${prod.producto_id}` });
    }
    if (typeof prod.precio_unitario !== 'number' || isNaN(prod.precio_unitario) || prod.precio_unitario < 0) {
      return res.status(400).json({ error: `Precio unitario inválido para producto ID ${prod.producto_id}` });
    }
  }

  const fecha = moment().tz('America/Argentina/Buenos_Aires').format();

  try {
    const erroresStock = await verificarStock(productos);
    if (erroresStock.length > 0)
      return res.status(400).json({ error: erroresStock.join(', ') });

    await db.query('BEGIN');

    const ventaResult = await db.query(
      `INSERT INTO ventas (fecha, total) VALUES ($1, $2) RETURNING id`,
      [fecha, total]
    );

    const ventaId = ventaResult.rows[0].id;

    for (const prod of productos) {
      const { producto_id, cantidad, precio_unitario, unidad, tipo_oferta, descuento } = prod;
      await db.query(
        `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, unidad, tipo_oferta, descuento)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [ventaId, producto_id, cantidad, precio_unitario, unidad, tipo_oferta, descuento || 0]
      );

      const cantidadConvertida = convertirACantidadBase(cantidad, unidad);

      await db.query(
        `UPDATE productos SET stock = stock - $1 WHERE id = $2`,
        [cantidadConvertida, producto_id]
      );
    }

    await db.query('COMMIT');
    res.json({ mensaje: '✅ Venta registrada correctamente' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error procesando venta:', error);
    res.status(500).json({ error: 'Error al procesar la venta' });
  }
});

router.get('/historial', async (req, res) => {
  try {
    const sql = `
      SELECT v.id as venta_id, v.fecha, v.total::float8 AS total,
             p.nombre as producto, dv.cantidad, dv.precio_unitario, dv.unidad, dv.descuento
      FROM ventas v
      JOIN detalle_ventas dv ON v.id = dv.venta_id
      JOIN productos p ON p.id = dv.producto_id
      ORDER BY v.fecha DESC
    `;
    const result = await db.query(sql);

    const historial = {};
    for (const row of result.rows) {
      if (!historial[row.venta_id]) {
        historial[row.venta_id] = {
          id: row.venta_id,
          fecha: row.fecha,
          total: row.total,
          productos: [],
        };
      }

      historial[row.venta_id].productos.push({
        nombre: row.producto,
        cantidad: row.cantidad,
        unidad: row.unidad,
        precio_unitario: row.precio_unitario,
        descuento: row.descuento || 0,
      });
    }

    res.json(Object.values(historial));
  } catch (error) {
    console.error('Error consultando historial:', error);
    res.status(500).json({ error: 'Error al consultar historial' });
  }
});

router.get('/detalle/:id', async (req, res) => {
  try {
    const ventaId = req.params.id;
    const sql = `
      SELECT v.id as venta_id, v.fecha, v.total::float8 AS total,
             p.nombre as producto, dv.cantidad, dv.precio_unitario, dv.unidad, dv.descuento
      FROM ventas v
      JOIN detalle_ventas dv ON v.id = dv.venta_id
      JOIN productos p ON p.id = dv.producto_id
      WHERE v.id = $1
    `;

    const result = await db.query(sql, [ventaId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Venta no encontrada' });

    const detalle = {
      id: result.rows[0].venta_id,
      fecha: result.rows[0].fecha,
      total: result.rows[0].total,
      productos: result.rows.map((r) => ({
        nombre: r.producto,
        cantidad: r.cantidad,
        unidad: r.unidad,
        precio_unitario: r.precio_unitario,
        descuento: r.descuento || 0,
      })),
    };

    res.json(detalle);
  } catch (error) {
    console.error('Error consultando detalle de venta:', error);
    res.status(500).json({ error: 'Error al consultar detalle de venta' });
  }
});

router.delete('/:id', async (req, res) => {
  const ventaId = req.params.id;

  try {
    await db.query('BEGIN');

    const productosRes = await db.query(`SELECT producto_id, cantidad, unidad FROM detalle_ventas WHERE venta_id = $1`, [ventaId]);
    if (productosRes.rowCount === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Venta no encontrada o sin detalle asociado' });
    }

    for (const { producto_id, cantidad, unidad } of productosRes.rows) {
      const cantidadBase = convertirACantidadBase(cantidad, unidad);
      await db.query(`UPDATE productos SET stock = stock + $1 WHERE id = $2`, [cantidadBase, producto_id]);
    }

    await db.query(`DELETE FROM detalle_ventas WHERE venta_id = $1`, [ventaId]);
    await db.query(`DELETE FROM ventas WHERE id = $1`, [ventaId]);

    await db.query('COMMIT');
    res.json({ mensaje: '✅ Venta anulada y stock restablecido' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error anulando venta:', error);
    res.status(500).json({ error: 'Error al eliminar venta' });
  }
});

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

router.get('/:id/ticket', async (req, res) => {
  const ventaId = req.params.id;

  try {
    const result = await db.query(
      `SELECT v.id as venta_id, v.fecha, v.total::float8 AS total,
              p.nombre as producto, dv.cantidad, dv.precio_unitario, dv.unidad, dv.descuento
       FROM ventas v
       JOIN detalle_ventas dv ON v.id = dv.venta_id
       JOIN productos p ON p.id = dv.producto_id
       WHERE v.id = $1`,
      [ventaId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Venta no encontrada' });

    const venta = result.rows[0];
    const productos = result.rows;

    const totalDescuento = productos.reduce((acc, p) => acc + (parseFloat(p.descuento) || 0), 0);

    const lineHeight = 18;
    const baseHeight = 140;
    const cantidadLineas = productos.length + 6;
    const alturaPDF = baseHeight + cantidadLineas * lineHeight;

    const doc = new PDFDocument({ margin: 20, size: [230, alturaPDF] });
    const filename = `ticket-venta-${ventaId}.pdf`;
    const filePath = path.join(__dirname, '../temp', filename);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    function padRight(text, length) {
      return text.length > length ? text.slice(0, length) : text.padEnd(length, ' ');
    }

    function padLeft(text, length) {
      return text.length > length ? text.slice(0, length) : text.padStart(length, ' ');
    }

    function imprimirLineaEtiquetaMonto(etiqueta, monto, signo = '') {
      const montoStr = signo + '$' + monto.toFixed(0);
      const lineWidth = 38;
      const espacios = lineWidth - etiqueta.length - montoStr.length;
      const espaciosStr = ' '.repeat(espacios > 0 ? espacios : 1);
      const texto = etiqueta + espaciosStr + montoStr;
      doc.font('Courier-Bold').text(texto);
    }

    doc.fontSize(10).font('Helvetica-Bold').text('Todo Limpio', { align: 'center' });
    doc.fontSize(8).font('Helvetica').text('Art. De Limpieza', { align: 'center' });
    doc.text('B° Campo Contreras', { align: 'center' });
    doc.moveDown(0.5);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString('es-AR')}`);
    doc.text(`N° Venta: ${ventaId}`);
    doc.text('Condición: Consumidor Final');
    doc.moveDown(0.5);
    doc.text('----------------------------------------');

    doc.font('Courier-Bold').text('Producto         Cant   P.U.    Subt');
    doc.font('Courier').text('----------------------------------------');

    productos.forEach(p => {
      const nombre = p.producto || 'Producto';
      const cantidad = (parseFloat(p.cantidad) || 0).toFixed(2);
      const precioUnitario = (parseFloat(p.precio_unitario) || 0).toFixed(0);
      const subtotal = ((parseFloat(p.precio_unitario) * parseFloat(p.cantidad)) - (parseFloat(p.descuento) || 0)).toFixed(0);

      const line =
        padRight(nombre, 16) + ' ' +
        padLeft(cantidad, 6) + ' ' +
        padLeft(precioUnitario, 6) + ' ' +
        padLeft(subtotal, 7);

      doc.text(line);
    });

    doc.text('----------------------------------------');

    const subtotal = productos.reduce((acc, p) => acc + (parseFloat(p.precio_unitario) * parseFloat(p.cantidad)), 0);

    imprimirLineaEtiquetaMonto('subtotal', subtotal);
    imprimirLineaEtiquetaMonto('descuentos', totalDescuento, '-');
    imprimirLineaEtiquetaMonto('total', venta.total);

    doc.moveDown(1);
    doc.font('Helvetica').fontSize(8).text('¡Gracias por su compra!', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, filename, () => {
        fs.unlinkSync(filePath);
      });
    });

  } catch (error) {
    console.error('Error generando ticket:', error);
    res.status(500).json({ error: 'Error generando el ticket PDF' });
  }
});

module.exports = router;
