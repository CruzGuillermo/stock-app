const db = require('./database');

const ofertas = [
  {
    nombre: '1L Lavandina + 1L Desodorante p/Piso + 1L Detergente',
    precio_total: 1800,
    items: [
      { nombre: 'Lavandina', cantidad: 1 },
      { nombre: 'Desodorante p/Piso', cantidad: 1 },
      { nombre: 'Detergente', cantidad: 1 },
    ],
  },
  {
    nombre: '1L Jabón + 1L Suavizante + 1L Lavandina',
    precio_total: 2400,
    items: [
      { nombre: 'Jabón Líquido', cantidad: 1 },
      { nombre: 'Suavizante', cantidad: 1 },
      { nombre: 'Lavandina', cantidad: 1 },
    ],
  },
  {
    nombre: '3L Lavandina + 3L Detergente + 3L Desodorante p/Piso',
    precio_total: 5000,
    items: [
      { nombre: 'Lavandina', cantidad: 3 },
      { nombre: 'Detergente', cantidad: 3 },
      { nombre: 'Desodorante p/Piso', cantidad: 3 },
    ],
  },
  {
    nombre: '3L Jabón Líquido + 3L Suavizante',
    precio_total: 5000,
    items: [
      { nombre: 'Jabón Líquido', cantidad: 3 },
      { nombre: 'Suavizante', cantidad: 3 },
    ],
  },
];

async function insertarOfertas() {
  for (const oferta of ofertas) {
    try {
      const res = await db.query(
        `INSERT INTO ofertas_especiales (nombre, precio_total) VALUES ($1, $2) RETURNING id`,
        [oferta.nombre, oferta.precio_total]
      );

      const ofertaId = res.rows[0].id;

      for (const item of oferta.items) {
        const productoRes = await db.query(
          `SELECT id FROM productos WHERE nombre = $1`,
          [item.nombre]
        );

        if (productoRes.rows.length === 0) {
          console.error(`❌ Producto no encontrado: ${item.nombre}`);
          continue;
        }

        const productoId = productoRes.rows[0].id;

        await db.query(
          `INSERT INTO detalle_oferta_especial (oferta_id, producto_id, cantidad)
           VALUES ($1, $2, $3)`,
          [ofertaId, productoId, item.cantidad]
        );

        console.log(`✅ Agregado ${item.cantidad} de ${item.nombre} a "${oferta.nombre}"`);
      }
    } catch (error) {
      console.error('❌ Error al insertar oferta:', error.message);
    }
  }
}

insertarOfertas();
