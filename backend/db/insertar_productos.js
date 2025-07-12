const db = require('./database');

const productos = [
  { nombre: 'Detergente', categoria: 'Limpieza', precio_0_5l: 600, precio_1l: 1000, precio_3l: 2400, unidad: 'litro' },
  { nombre: 'Lavandina', categoria: 'Limpieza', precio_0_5l: 450, precio_1l: 800, precio_3l: 1800, unidad: 'litro' },
  { nombre: 'Suavizante', categoria: 'Limpieza', precio_0_5l: 600, precio_1l: 1000, precio_3l: 2400, unidad: 'litro' },
  { nombre: 'Jabón Líquido', categoria: 'Limpieza', precio_0_5l: 750, precio_1l: 1200, precio_3l: 3000, unidad: 'litro' },
  { nombre: 'Desodorante p/Piso', categoria: 'Limpieza', precio_0_5l: 250, precio_1l: 400, precio_3l: 900, unidad: 'litro' },
  { nombre: 'Desodorante tipo Lysoform', categoria: 'Limpieza', precio_0_5l: 270, precio_1l: 450, precio_3l: 1200, unidad: 'litro' },
];

async function insertarProductos() {
  for (const p of productos) {
    try {
      await db.query(
        `INSERT INTO productos (nombre, categoria, precio_0_5l, precio_1l, precio_3l, unidad)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.nombre, p.categoria, p.precio_0_5l, p.precio_1l, p.precio_3l, p.unidad]
      );
      console.log(`✅ Producto agregado: ${p.nombre}`);
    } catch (error) {
      console.error('❌ Error al insertar producto:', error.message);
    }
  }
}

insertarProductos();
