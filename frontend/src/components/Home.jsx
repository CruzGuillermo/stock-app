import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="bubble-overlay">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="bubble" />
        ))}
      </div>

      <div className="home-content container text-center text-white d-flex flex-column justify-content-center align-items-center py-5">
        <div className="logo mb-4">
          <span role="img" aria-label="logo" style={{ fontSize: '5rem' }}>🧴</span>
        </div>
        <h1 className="display-4 fw-bold">
          Bienvenido a <span className="text-info">StockApp</span>
        </h1>
        <p className="lead">Gestión inteligente para productos de limpieza y líquidos 💧</p>

        <div className="d-flex flex-wrap justify-content-center gap-3 mt-5">
          {[{
            to: '/productos',
            emoji: '🧼',
            title: 'Productos',
            desc: 'Gestión completa de artículos',
          }, {
            to: '/ventas',
            emoji: '💰',
            title: 'Registrar Venta',
            desc: 'Venta rápida y control de ingresos',
          }, {
            to: '/resumen',
            emoji: '📊',
            title: 'Resumen',
            desc: 'Analiza el rendimiento del negocio',
          }].map(({ to, emoji, title, desc }) => (
            <Link
              to={to}
              key={to}
              className="home-card text-white text-decoration-none d-flex flex-column align-items-center p-4 rounded"
              style={{ minWidth: '220px', flex: '1 1 220px', maxWidth: '280px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="emoji mb-3" style={{ fontSize: '2.5rem' }}>{emoji}</span>
              <h5>{title}</h5>
              <p>{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
