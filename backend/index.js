require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const ingresosStockRoutes = require('./routes/ingresosStock');
const ofertasRoutes = require('./routes/ofertas');
const resumenRoutes = require('./routes/resumen');

const app = express();

// Habilitar CORS para permitir conexiones desde cualquier frontend
app.use(cors({
  origin: 'https://stock-app-cruzguillermos-projects.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ API backend corriendo con base de datos PostgreSQL');
});

// Rutas con prefijo común
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/ingresos-stock', ingresosStockRoutes);
app.use('/api/ofertas', ofertasRoutes);
app.use('/api/resumen', resumenRoutes);

// Verificación de conexión a la base de datos
const pool = require('./db/database');
app.get('/api/ping-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (error) {
    console.error('❌ Error al conectar con la base:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Escuchar en puerto dinámico (Render lo asigna automáticamente)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
});
