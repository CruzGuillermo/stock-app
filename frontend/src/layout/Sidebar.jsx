import { NavLink } from 'react-router-dom';
import { useUser } from '../components/UserContext'; // Asegurate que el path sea correcto

const Sidebar = ({ isOpen, onClose }) => {
  const { setUsuario } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    window.location.href = '/login'; // redirige al login
  };

  return (
    <>
      <nav
        className={`bg-dark text-white position-fixed top-0 start-0 vh-100 p-3 overflow-auto d-flex flex-column justify-content-between ${
          isOpen ? 'd-block' : 'd-none'
        } d-md-block`}
        style={{ width: '250px', zIndex: 1040 }}
        onClick={onClose}
      >
        {/* Parte superior */}
        <div>
          <h4>📦 StockApp</h4>
          <hr />
          <ul className="nav flex-column">
            {[
              { to: '/', label: '🏠 Inicio' },
              { to: '/productos', label: '📦 Productos' },
              { to: '/stock', label: '📊 Stock' },
              { to: '/ofertas', label: '🎉 Ofertas' },
              { to: '/ventas', label: '💸 Ventas' },
              { to: '/vender-oferta', label: '🛍️ Vender Oferta' },
              { to: '/ventas/historial', label: '🕒 Historial Ventas' },
              { to: '/ventas/fiados', label: '📄 Ventas Fiadas' },
              { to: '/ingresos-stock', label: '➕ Ingresos' },
              { to: '/ingresos-stock/historial', label: '📋 Historial Ingreso' },
              { to: '/resumen', label: '📈 Resumen' },
            ].map(({ to, label }) => (
              <li className="nav-item" key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    'nav-link text-white ' + (isActive ? 'bg-primary rounded' : '')
                  }
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Parte inferior: Cerrar sesión */}
        <div>
          <hr />
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-outline-light w-100"
          >
            🔒 Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="d-none d-md-block" style={{ width: '250px', flexShrink: 0 }} />
    </>
  );
};

export default Sidebar;
