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

      <div className="home-content container text-white d-flex flex-column justify-content-center align-items-center py-4">
        <div className="text-center mb-4">
          <div style={{ fontSize: '4rem' }}>🧴</div>
          <h2 className="fw-bold mt-2" style={{ fontSize: '1.8rem' }}>
            StockApp
          </h2>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-3 w-100 px-2">
          {[
            {
              to: '/productos',
              emoji: '🧼',
              title: 'Productos',
              desc: 'Artículos y stock',
            },
            {
              to: '/ventas',
              emoji: '💰',
              title: 'Ventas',
              desc: 'Registrar y consultar',
            },
            {
              to: '/resumen',
              emoji: '📊',
              title: 'Resumen',
              desc: 'Gráficos y reportes',
            },
          ].map(({ to, emoji, title, desc }) => (
            <Link
              to={to}
              key={to}
              className="home-card text-white text-decoration-none d-flex flex-column align-items-center p-3 rounded shadow-sm"
              style={{
                minWidth: '150px',
                flex: '1 1 150px',
                maxWidth: '200px',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem' }}>{emoji}</div>
              <div className="fw-semibold mt-2">{title}</div>
              <small style={{ fontSize: '0.85rem' }}>{desc}</small>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
