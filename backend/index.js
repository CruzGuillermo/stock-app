require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const ingresosStockRoutes = require('./routes/ingresosStock');
const ofertasRoutes = require('./routes/ofertas');
const resumenRoutes = require('./routes/resumen');


const app = express();
const port = 3001;

// Habilitar CORS para permitir conexiones desde el frontend en el celular
app.use(cors({
  origin: '*', // O podés poner: 'http://192.168.100.47:5173' si querés limitarlo
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API backend corriendo con base de datos');
});

// Rutas
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);
app.use('/ingresos-stock', ingresosStockRoutes);
app.use('/ofertas', ofertasRoutes);
app.use('/resumen', resumenRoutes);


const pool = require('./db/database');

app.get('/ping-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (error) {
    console.error('❌ Error al conectar con la base:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});


// Escuchar en todas las interfaces (para poder acceder desde la red)
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Backend escuchando en http://0.0.0.0:${port}`);
});
