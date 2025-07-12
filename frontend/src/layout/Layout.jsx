import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className="d-flex flex-column flex-md-row vh-100 position-relative"
      style={{ overflow: 'hidden' }}
    >
      

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div
        className="flex-grow-1 d-flex flex-column"
        style={{ position: 'relative', zIndex: 1, overflow: 'hidden' }}
      >
        <Header toggleSidebar={toggleSidebar} />
        <main
          className="flex-grow-1 p-3"
          style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
          onClick={closeSidebar} // cerrar sidebar al click en contenido móvil
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
