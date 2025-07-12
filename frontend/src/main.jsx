import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

// Detectar si está corriendo en Electron
const isElectron = window?.process?.type === 'renderer';

// Detectar si accedés desde otro dispositivo (celular)
const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

axios.defaults.baseURL = isElectron
  ? 'http://127.0.0.1:3001' // para Electron
  : isLocalhost
  ? 'http://localhost:3001' // para la PC
  : 'http://192.168.100.44:3001'; // para el celular

axios.defaults.headers.common['Content-Type'] = 'application/json';


// Renderizar app
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
