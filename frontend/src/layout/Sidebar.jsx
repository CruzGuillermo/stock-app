import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Sidebar */}
      <nav
        className={`bg-dark text-white position-fixed top-0 start-0 vh-100 p-3 overflow-auto ${
          isOpen ? 'd-block' : 'd-none'
        } d-md-block`}
        style={{ width: '250px', zIndex: 1040 }}
        onClick={onClose} // cierra menú al clickear enlace en móvil
      >
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
      </nav>

      {/* Espaciador para no tapar contenido en desktop */}
      <div className="d-none d-md-block" style={{ width: '250px', flexShrink: 0 }} />
    </>
  );
};

export default Sidebar;
