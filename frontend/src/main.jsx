import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

// Detectar si estamos en localhost para desarrollo
const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// Definir baseURL según entorno
const baseURL = isLocalhost
  ? 'http://localhost:3001/api' // Backend local en desarrollo
  : import.meta.env.VITE_API_URL || 'https://stock-app-n514.onrender.com/api'; // Producción

axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
