import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "../src/layout/Layout";

import Home from './components/Home';
import Productos from './components/Productos';
import Stock from './components/Stock';
import OfertasEspeciales from './components/OfertasEspeciales';
import Ventas from './components/Ventas';
import HistorialVentas from './components/HistorialVentas';
import DetalleVenta from './components/DetalleVenta';
import IngresosStock from './components/IngresosStock';
import ResumenFinanciero from './components/ResumenFinanciero';
import VenderOferta from './components/VenderOferta';
import HistorialIngreso from './components/HistorialIngreso'; // Importar el componente
import Fiados from './components/Fiados';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/ventas/fiados" element={<Fiados />} />
          <Route path="productos" element={<Productos />} />
          <Route path="stock" element={<Stock />} />
          <Route path="ofertas" element={<OfertasEspeciales />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="vender-oferta" element={<VenderOferta />} />
          <Route path="ventas/historial" element={<HistorialVentas />} />
          <Route path="ventas/detalle/:id" element={<DetalleVenta />} />
          <Route path="ingresos-stock" element={<IngresosStock />} />
          <Route path="resumen" element={<ResumenFinanciero />} />
          <Route path="ingresos-stock/historial" element={<HistorialIngreso />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
