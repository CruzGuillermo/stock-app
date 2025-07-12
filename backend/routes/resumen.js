const express = require('express');
const db = require('../db/database'); // Pool de pg
const router = express.Router();

router.get('/balance-avanzado', async (req, res) => {
  try {
    // 1. Inversión total
    const inversionRes = await db.query(`SELECT SUM(cantidad * precio_unitario) AS inversion_total FROM ingresos_stock`);
    const inversionTotal = inversionRes.rows[0].inversion_total || 0;

    // 2. Total ventas
    const ventasRes = await db.query(`SELECT SUM(total) AS total_ventas FROM ventas`);
    const totalVentas = ventasRes.rows[0].total_ventas || 0;

    // 3. Cantidad total ingresada por producto para costo promedio ponderado
    const ingresosPorProductoRes = await db.query(`
      SELECT producto_id, SUM(cantidad) AS total_cant, SUM(cantidad * precio_unitario) AS total_valor
      FROM ingresos_stock
      GROUP BY producto_id
    `);

    // 4. Cantidad total vendida por producto
    const ventasPorProductoRes = await db.query(`
      SELECT producto_id, SUM(cantidad) AS total_vendido
      FROM detalle_ventas
      GROUP BY producto_id
    `);

    // 5. Calcular costo real de lo vendido
    let costoRealTotal = 0;

    const ingresosMap = {};
    for (const i of ingresosPorProductoRes.rows) {
      ingresosMap[i.producto_id] = {
        total_cant: parseFloat(i.total_cant),
        costo_promedio: parseFloat(i.total_valor) / parseFloat(i.total_cant)
      };
    }

    for (const v of ventasPorProductoRes.rows) {
      const ingreso = ingresosMap[v.producto_id];
      if (ingreso) {
        costoRealTotal += parseFloat(v.total_vendido) * ingreso.costo_promedio;
      }
    }

    // 6. Ganancia
    const ganancia = totalVentas - costoRealTotal;

    res.json({
      inversion_total: parseFloat(inversionTotal),
      ventas_total: parseFloat(totalVentas),
      costo_real_ventas: costoRealTotal,
      ganancia,
      balance: ganancia,
    });
  } catch (error) {
    console.error('Error al calcular resumen avanzado:', error);
    res.status(500).json({ error: 'Error interno al calcular resumen financiero' });
  }
});

router.get('/resumen-financiero', async (req, res) => {
  try {
    // Total ventas
    const totalVentasRes = await db.query(`SELECT COALESCE(SUM(total), 0) AS total_ventas FROM ventas`);
    const totalVentas = totalVentasRes.rows[0].total_ventas;

    // Total ingresos
    const totalIngresosRes = await db.query(`SELECT COALESCE(SUM(cantidad * precio_unitario), 0) AS total_ingresos FROM ingresos_stock`);
    const totalIngresos = totalIngresosRes.rows[0].total_ingresos;

    // Reutilizar cálculo costo promedio ponderado (igual que balance-avanzado)
    const ingresosPorProductoRes = await db.query(`
      SELECT producto_id, SUM(cantidad) AS total_cant, SUM(cantidad * precio_unitario) AS total_valor
      FROM ingresos_stock
      GROUP BY producto_id
    `);

    const ventasPorProductoRes = await db.query(`
      SELECT producto_id, SUM(cantidad) AS total_vendido
      FROM detalle_ventas
      GROUP BY producto_id
    `);

    let costoRealTotal = 0;
    const ingresosMap = {};
    for (const i of ingresosPorProductoRes.rows) {
      ingresosMap[i.producto_id] = {
        total_cant: parseFloat(i.total_cant),
        costo_promedio: parseFloat(i.total_valor) / parseFloat(i.total_cant)
      };
    }

    for (const v of ventasPorProductoRes.rows) {
      const ingreso = ingresosMap[v.producto_id];
      if (ingreso) {
        costoRealTotal += parseFloat(v.total_vendido) * ingreso.costo_promedio;
      }
    }

    const ganancia = totalVentas - costoRealTotal;

    res.json({
      total_ventas: totalVentas,
      total_ingresos: totalIngresos,
      costo_real_ventas: costoRealTotal,
      ganancia,
    });
  } catch (error) {
    console.error('Error en resumen financiero:', error);
    res.status(500).json({ error: 'Error interno al calcular resumen financiero' });
  }
});

router.get('/top-productos', async (req, res) => {
  try {
    const sql = `
      SELECT p.id, p.nombre AS nombre_producto, p.categoria, 
             SUM(dv.cantidad) AS total_vendido
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      GROUP BY p.id
      ORDER BY total_vendido DESC
      LIMIT 5
    `;

    const result = await db.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo top productos:', error);
    res.status(500).json({ error: 'Error en consulta SQL' });
  }
});

module.exports = router;
