// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stockTotal, setStockTotal] = useState(0);
  const [inversionTotal, setInversionTotal] = useState(0);
  const [ventasHoy, setVentasHoy] = useState(0);
  const [productosBajoStock, setProductosBajoStock] = useState([]);

  useEffect(() => {
    axios.get('/resumen/stock-total')
      .then(res => setStockTotal(res.data.stock_total))
      .catch(console.error);

    axios.get('/inversion-total')
      .then(res => setInversionTotal(res.data.inversion_total))
      .catch(console.error);

    axios.get('/ventas/hoy')
      .then(res => setVentasHoy(res.data.total_hoy))
      .catch(console.error);

    axios.get('/productos/stock-bajo')
      .then(res => setProductosBajoStock(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="container mt-4">
      <h2>📊 Dashboard General</h2>

      <div className="row text-center mt-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Stock Total</h5>
              <p className="card-text">{stockTotal} unidades/litros</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Inversión Total</h5>
              <p className="card-text">${inversionTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Ventas Hoy</h5>
              <p className="card-text">${ventasHoy.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {productosBajoStock.length > 0 && (
        <div className="mt-5">
          <h4>⚠️ Productos con stock bajo</h4>
          <ul className="list-group">
            {productosBajoStock.map(prod => (
              <li key={prod.id} className="list-group-item d-flex justify-content-between align-items-center">
                {prod.nombre}
                <span className="badge bg-danger">{prod.stock_litros} l / {prod.stock_ml} ml</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;