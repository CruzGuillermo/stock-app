const express = require('express');
const db = require('../db/database'); // pool exportado directamente
const router = express.Router();

function convertirACantidadBase(cantidad, unidad) {
  switch (unidad) {
    case 'medio_litro': return cantidad * 0.5;
    case 'litro': return cantidad;
    case 'unidad': return cantidad;
    case 'kilogramo': return cantidad; // corregido a 'kilogramo' para consistencia
    case 'gramo': return cantidad / 1000;
    default: return cantidad;
  }
}

// POST / - registrar ingreso de stock
router.post('/', async (req, res) => {
  const { producto_id, fecha, cantidad, precio_unitario, unidad, observaciones } = req.body;

  if (
    !producto_id ||
    !fecha ||
    typeof cantidad !== 'number' || cantidad <= 0 ||
    typeof precio_unitario !== 'number' || precio_unitario <= 0 ||
    !unidad
  ) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o valores inválidos (cantidad y precio_unitario deben ser positivos)' });
  }

  const cantidadBase = convertirACantidadBase(cantidad, unidad);

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const insertIngreso = `
      INSERT INTO ingresos_stock (producto_id, fecha, cantidad, precio_unitario, unidad, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const result = await client.query(insertIngreso, [
      producto_id,
      fecha,
      cantidad,
      precio_unitario,
      unidad,
      observaciones || null,
    ]);

    await client.query(
      `UPDATE productos SET stock = stock + $1 WHERE id = $2`,
      [cantidadBase, producto_id]
    );

    await client.query('COMMIT');

    res.json({ mensaje: 'Ingreso de stock registrado y stock actualizado', ingresoId: result.rows[0].id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar ingreso de stock:', error);
    res.status(500).json({ error: 'Error al registrar ingreso de stock', details: error.message });
  } finally {
    client.release();
  }
});

// GET /inversion-total
router.get('/inversion-total', async (req, res) => {
  try {
    const result = await db.query(`SELECT SUM(cantidad * precio_unitario) AS inversion_total FROM ingresos_stock`);
    res.json({ inversion_total: parseFloat(result.rows[0].inversion_total) || 0 });
  } catch (error) {
    console.error('Error al consultar inversión total:', error);
    res.status(500).json({ error: 'Error al consultar inversión total' });
  }
});

// GET /historial
// GET /historial
router.get('/historial', async (req, res) => {
  try {
    const sql = `
      SELECT
        ing.id,
        ing.producto_id,
        p.nombre AS producto_nombre,
        ing.fecha,
        ing.cantidad::float8 AS cantidad,
        ing.precio_unitario::float8 AS precio_unitario,
        ing.unidad,
        ing.observaciones
      FROM ingresos_stock ing
      JOIN productos p ON ing.producto_id = p.id
      ORDER BY ing.fecha DESC
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});


// DELETE /:id
router.delete('/:id', async (req, res) => {
  const ingresoId = req.params.id;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const ingresoRes = await client.query(`SELECT * FROM ingresos_stock WHERE id = $1`, [ingresoId]);
    if (ingresoRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    const ingreso = ingresoRes.rows[0];
    const cantidadBase = convertirACantidadBase(ingreso.cantidad, ingreso.unidad);

    await client.query(`DELETE FROM ingresos_stock WHERE id = $1`, [ingresoId]);
    await client.query(`UPDATE productos SET stock = stock - $1 WHERE id = $2`, [cantidadBase, ingreso.producto_id]);

    await client.query('COMMIT');
    res.json({ mensaje: 'Ingreso eliminado y stock actualizado' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar ingreso:', error);
    res.status(500).json({ error: 'Error al eliminar ingreso' });
  } finally {
    client.release();
  }
});

// PUT /:id
router.put('/:id', async (req, res) => {
  const ingresoId = req.params.id;
  const { producto_id, fecha, cantidad, precio_unitario, unidad, observaciones } = req.body;

  if (
    !producto_id ||
    !fecha ||
    typeof cantidad !== 'number' || cantidad <= 0 ||
    typeof precio_unitario !== 'number' || precio_unitario <= 0 ||
    !unidad
  ) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o valores inválidos (cantidad y precio_unitario deben ser positivos)' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const ingresoOriginalRes = await client.query(`SELECT * FROM ingresos_stock WHERE id = $1`, [ingresoId]);
    if (ingresoOriginalRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    const ingresoOriginal = ingresoOriginalRes.rows[0];
    const cantidadOriginalBase = convertirACantidadBase(ingresoOriginal.cantidad, ingresoOriginal.unidad);
    const cantidadNuevaBase = convertirACantidadBase(cantidad, unidad);

    const sqlUpdate = `
      UPDATE ingresos_stock
      SET producto_id = $1, fecha = $2, cantidad = $3, precio_unitario = $4, unidad = $5, observaciones = $6
      WHERE id = $7
    `;

    await client.query(sqlUpdate, [
      producto_id,
      fecha,
      cantidad,
      precio_unitario,
      unidad,
      observaciones || null,
      ingresoId,
    ]);

    // Actualizar stock con diferencia entre cantidad nueva y antigua en unidades base
    const diferencia = cantidadNuevaBase - cantidadOriginalBase;

    await client.query(`UPDATE productos SET stock = stock + $1 WHERE id = $2`, [diferencia, producto_id]);

    await client.query('COMMIT');
    res.json({ mensaje: 'Ingreso editado y stock actualizado' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al editar ingreso:', error);
    res.status(500).json({ error: 'Error al actualizar ingreso' });
  } finally {
    client.release();
  }
});

module.exports = router;
