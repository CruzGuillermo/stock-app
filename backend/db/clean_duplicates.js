const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'stock.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos para limpieza:', err.message);
  } else {
    console.log('📦 Base de datos conectada para limpieza.');
    cleanDuplicates();
  }
});

function cleanDuplicates() {
  db.serialize(() => {
    // PASO 1: HAZ UNA COPIA DE SEGURIDAD MANUALMENTE DEL ARCHIVO stock.db
    console.log('\n⚠️  ¡IMPORTANTE! Asegúrate de haber hecho una COPIA DE SEGURIDAD de tu archivo stock.db antes de continuar. ⚠️\n');

    // Paso 2: Identificar y mostrar los productos duplicados (opcional, para verificación)
    db.all(`
      SELECT nombre, COUNT(*) as count
      FROM productos
      GROUP BY nombre
      HAVING COUNT(*) > 1;
    `, (err, rows) => {
      if (err) {
        console.error('❌ Error al identificar duplicados:', err.message);
        return;
      }
      if (rows.length === 0) {
        console.log('✅ No se encontraron productos duplicados por nombre.');
      } else {
        console.log('❗ Productos duplicados encontrados antes de la limpieza:');
        rows.forEach(row => {
          console.log(`- Nombre: "${row.nombre}", Cantidad de duplicados: ${row.count}`);
        });

        // Paso 3: Eliminar los registros duplicados, manteniendo el ID más bajo (el original)
        db.run(`
          DELETE FROM productos
          WHERE id NOT IN (
              SELECT MIN(id)
              FROM productos
              GROUP BY nombre
          );
        `, function(err) {
          if (err) {
            console.error('❌ Error al eliminar productos duplicados:', err.message);
          } else {
            console.log(`✅ Se eliminaron ${this.changes} registros duplicados.`);
            console.log('Verificando después de la limpieza...');

            // Paso 4: Verificar la eliminación
            db.all(`
              SELECT nombre, COUNT(*) as count
              FROM productos
              GROUP BY nombre
              HAVING COUNT(*) > 1;
            `, (err, finalRows) => {
              if (err) {
                console.error('❌ Error al verificar después de la limpieza:', err.message);
                return;
              }
              if (finalRows.length === 0) {
                console.log('🎉 ¡Limpieza completada! Todos los productos son únicos por nombre.');
              } else {
                console.error('🔴 Aún quedan duplicados. Revisa el script o tu base de datos.');
                finalRows.forEach(row => {
                  console.log(`- Nombre: "${row.nombre}", Cantidad de duplicados: ${row.count}`);
                });
              }
              db.close();
            });
          }
        });
      }
    });
  });
}