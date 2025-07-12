import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function TopProductos() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarTopProductos();
  }, []);

  const cargarTopProductos = async () => {
    try {
      const res = await axios.get('/resumen/top-productos');
      setProductos(res.data);
    } catch (err) {
      setError('Error cargando productos');
      console.error(err);
    }
  };

  if (error) return <div className="alert alert-danger mt-4">{error}</div>;
  if (!productos.length) return <div className="mt-4">Cargando...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: '700px' }}>
      <h2 className="mb-4 text-center">Top 5 Productos Más Vendidos</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={productos} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre_producto" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total_vendido" fill="#0d6efd" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
