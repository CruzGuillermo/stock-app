const express = require('express');
const db = require('../db/database'); // Pool de pg
const router = express.Router();

// Obtener todas las ofertas
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT o.id as oferta_id, o.nombre as oferta_nombre, o.precio_total::float as precio_total,
             d.producto_id, p.nombre as producto_nombre, d.cantidad, d.unidad
      FROM ofertas_especiales o
      JOIN detalle_oferta_especial d ON o.id = d.oferta_id
      JOIN productos p ON p.id = d.producto_id
    `;

    const { rows } = await db.query(sql);

    const ofertas = {};
    rows.forEach(row => {
      if (!ofertas[row.oferta_id]) {
        ofertas[row.oferta_id] = {
          id: row.oferta_id,
          nombre: row.oferta_nombre,
          precio_total: row.precio_total,
          items: [],
        };
      }
      ofertas[row.oferta_id].items.push({
        producto_id: row.producto_id,
        nombre: row.producto_nombre,
        cantidad: row.cantidad,
        unidad: row.unidad || 'unidad',
      });
    });

    res.json(Object.values(ofertas));
  } catch (err) {
    console.error('❌ Error al consultar ofertas:', err.message);
    res.status(500).json({ error: 'Error al consultar ofertas' });
  }
});

// Crear nueva oferta
router.post('/', async (req, res) => {
  const { nombre, precio_total, items } = req.body;

  if (!nombre || !precio_total || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const insertOfertaText = `INSERT INTO ofertas_especiales (nombre, precio_total) VALUES ($1, $2) RETURNING id`;
    const { rows } = await client.query(insertOfertaText, [nombre, precio_total]);
    const ofertaId = rows[0].id;

    const insertDetalleText = `
      INSERT INTO detalle_oferta_especial (oferta_id, producto_id, cantidad, unidad)
      VALUES ($1, $2, $3, $4)
    `;

    for (const item of items) {
      await client.query(insertDetalleText, [
        ofertaId,
        item.producto_id,
        item.cantidad,
        item.unidad || 'unidad',
      ]);
    }

    await client.query('COMMIT');
    res.json({ message: '✅ Oferta creada correctamente', ofertaId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error al crear oferta:', err.message);
    res.status(500).json({ error: 'Error al crear oferta' });
  } finally {
    client.release();
  }
});

// Actualizar oferta
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio_total, items } = req.body;

  if (!nombre || !precio_total || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const updateOfertaText = `UPDATE ofertas_especiales SET nombre = $1, precio_total = $2 WHERE id = $3`;
    await client.query(updateOfertaText, [nombre, precio_total, id]);

    await client.query(`DELETE FROM detalle_oferta_especial WHERE oferta_id = $1`, [id]);

    const insertDetalleText = `
      INSERT INTO detalle_oferta_especial (oferta_id, producto_id, cantidad, unidad)
      VALUES ($1, $2, $3, $4)
    `;

    for (const item of items) {
      await client.query(insertDetalleText, [
        id,
        item.producto_id,
        item.cantidad,
        item.unidad || 'unidad',
      ]);
    }

    await client.query('COMMIT');
    res.json({ message: '✏️ Oferta actualizada correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error al actualizar oferta:', err.message);
    res.status(500).json({ error: 'Error al actualizar oferta' });
  } finally {
    client.release();
  }
});

// Eliminar oferta
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const client = await db.connect();

  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM detalle_oferta_especial WHERE oferta_id = $1`, [id]);
    await client.query(`DELETE FROM ofertas_especiales WHERE id = $1`, [id]);
    await client.query('COMMIT');

    res.json({ message: '🗑️ Oferta eliminada correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error al eliminar oferta:', err.message);
    res.status(500).json({ error: 'Error al eliminar oferta' });
  } finally {
    client.release();
  }
});

module.exports = router;
