const express = require('express');
const db = require('../db/database'); // Pool pg
const router = express.Router();

// GET /productos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
     SELECT 
  id,
  nombre,
  categoria,
  stock,
  unidad,
  stock_minimo,
  precio_0_5l::float AS precio_0_5l,
  precio_1l::float AS precio_1l,
  precio_3l::float AS precio_3l,
  precio_unidad::float AS precio_unidad,
  precio_kg::float AS precio_kg,
  precio_gramo::float AS precio_gramo,

  CASE
    WHEN unidad = 'unidad' THEN precio_unidad
    WHEN unidad = 'kilogramo' THEN precio_kg
    WHEN unidad = 'gramo' THEN precio_gramo
    WHEN unidad = 'litro' THEN precio_1l
    WHEN unidad = 'medio_litro' THEN precio_0_5l
    WHEN unidad = '3litros' THEN precio_3l
    ELSE NULL
  END::float AS precio_venta

FROM productos
WHERE activo = TRUE

    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al consultar productos:', err.message);
    res.status(500).json({ error: 'Error al consultar productos' });
  }
});


// POST /productos
router.post('/', async (req, res) => {
  const {
    nombre,
    categoria,
    stock,
    unidad,
    precio_0_5l,
    precio_1l,
    precio_3l,
    precio_unidad,
    precio_kg,
    precio_gramo,
    stock_minimo
  } = req.body;

  const sql = `
    INSERT INTO productos (
      nombre, categoria, stock, unidad,
      precio_0_5l, precio_1l, precio_3l,
      precio_unidad, precio_kg, precio_gramo,
      stock_minimo, activo
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, TRUE)
    RETURNING id
  `;

  try {
    const result = await db.query(sql, [
      nombre, categoria, stock, unidad,
      precio_0_5l, precio_1l, precio_3l,
      precio_unidad, precio_kg, precio_gramo,
      stock_minimo
    ]);
    res.json({ mensaje: '✅ Producto creado correctamente', id: result.rows[0].id });
  } catch (err) {
    console.error('❌ Error al crear producto:', err.message);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /productos/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    categoria,
    stock,
    unidad,
    precio_0_5l,
    precio_1l,
    precio_3l,
    precio_unidad,
    precio_kg,
    precio_gramo,
    stock_minimo
  } = req.body;

  const sql = `
    UPDATE productos
    SET nombre = $1, categoria = $2, stock = $3, unidad = $4,
        precio_0_5l = $5, precio_1l = $6, precio_3l = $7,
        precio_unidad = $8, precio_kg = $9, precio_gramo = $10,
        stock_minimo = $11
    WHERE id = $12
  `;

  try {
    await db.query(sql, [
      nombre, categoria, stock, unidad,
      precio_0_5l, precio_1l, precio_3l,
      precio_unidad, precio_kg, precio_gramo,
      stock_minimo, id
    ]);
    res.json({ mensaje: '✅ Producto actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar producto:', err.message);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /productos/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE productos SET activo = FALSE WHERE id = $1', [id]);
    res.json({ mensaje: '✅ Producto eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// POST /productos/:id/stock
router.post('/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { cantidad, operacion } = req.body;

  const valor = operacion === 'restar' ? -Math.abs(cantidad) : Math.abs(cantidad);

  try {
    await db.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [valor, id]);
    res.json({ mensaje: '✅ Stock actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al modificar stock:', err.message);
    res.status(500).json({ error: 'Error al modificar stock' });
  }
});

// GET /productos/buscar/:nombre
router.get('/buscar/:nombre', async (req, res) => {
  const nombre = req.params.nombre.toLowerCase();
  try {
    const result = await db.query(
      `SELECT id, nombre, stock, unidad FROM productos WHERE LOWER(nombre) LIKE $1`,
      [`%${nombre}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error en búsqueda:', err.message);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
});

// GET /productos/stock
router.get('/stock', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre, stock, unidad, categoria, stock_minimo FROM productos WHERE activo = TRUE`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error en consulta /stock:', err.message);
    res.status(500).json({ error: 'Error al consultar stock' });
  }
});

module.exports = router;
