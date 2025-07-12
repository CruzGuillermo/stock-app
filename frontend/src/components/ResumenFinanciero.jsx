import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie,
} from 'recharts';

export default function ResumenFinanciero() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    try {
      const res = await axios.get('/resumen/resumen-financiero');
      setResumen(res.data);
    } catch (err) {
      setError('Error cargando resumen financiero');
    }
  };

  const formatoMoneda = (num) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number(num) || 0);

  if (error) {
    return (
      <div className="container mt-4 alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!resumen) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  const fechaArchivo = new Date().toISOString().split('T')[0];
  const totalVentas = Number(resumen.total_ventas) || 0;
  const totalIngresos = Number(resumen.total_ingresos) || 0;
  const gananciaNeta = Number(resumen.ganancia) || 0;

  const data = [
    { nombre: 'Ventas', valor: totalVentas, color: '#0d6efd' },
    { nombre: 'Ingresos', valor: totalIngresos, color: '#198754' },
    { nombre: 'Ganancia', valor: gananciaNeta, color: '#dc3545' },
  ];

  const exportarPDF = () => {
    const doc = new jsPDF();
    const fechaHora = new Date().toLocaleString('es-AR');

    doc.setFontSize(16);
    doc.text('Resumen Financiero', 14, 20);
    doc.setFontSize(10);
    doc.text(`Exportado: ${fechaHora}`, 14, 26);

    autoTable(doc, {
      head: [['Concepto', 'Monto']],
      body: [
        ['Total Ventas', formatoMoneda(totalVentas)],
        ['Total Ingresos', formatoMoneda(totalIngresos)],
        ['Ganancia Neta', formatoMoneda(gananciaNeta)],
      ],
      startY: 35,
    });

    doc.save(`resumen-financiero-${fechaArchivo}.pdf`);
  };

  const exportarExcel = () => {
    const fechaHora = new Date().toLocaleString('es-AR');
    const hoja = [
      ['Resumen Financiero'],
      [`Exportado: ${fechaHora}`],
      [],
      ['Concepto', 'Monto'],
      ['Total Ventas', totalVentas],
      ['Total Ingresos', totalIngresos],
      ['Ganancia Neta', gananciaNeta],
    ];

    const ws = XLSX.utils.aoa_to_sheet(hoja);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resumen');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `resumen-financiero-${fechaArchivo}.xlsx`);
  };

  return (
    <div className="container mt-4 px-3 px-md-4 px-lg-5">
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-5">
        <h2 className="text-center mb-4 text-primary fw-bold">📊 Resumen Financiero</h2>

        <div className="list-group mb-4">
          <div className="list-group-item d-flex justify-content-between fw-semibold">
            <span>Total Ventas:</span>
            <span>{formatoMoneda(totalVentas)}</span>
          </div>
          <div className="list-group-item d-flex justify-content-between fw-semibold">
            <span>Total Ingresos:</span>
            <span>{formatoMoneda(totalIngresos)}</span>
          </div>
          <div className="list-group-item d-flex justify-content-between fw-semibold">
            <span>Ganancia Neta:</span>
            <span>{formatoMoneda(gananciaNeta)}</span>
          </div>
        </div>

        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
          <button className="btn btn-outline-danger w-100 w-sm-auto" onClick={exportarPDF}>
            📄 Exportar PDF
          </button>
          <button className="btn btn-outline-success w-100 w-sm-auto" onClick={exportarExcel}>
            📊 Exportar Excel
          </button>
        </div>

        <h5 className="text-center text-secondary mt-4 mb-2">Gráfico de Barras</h5>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip formatter={(value) => formatoMoneda(value)} />
              <Bar dataKey="valor">
                {data.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} radius={[10, 10, 0, 0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h5 className="text-center text-secondary mt-5 mb-2">Gráfico de Torta</h5>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`pie-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatoMoneda(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
