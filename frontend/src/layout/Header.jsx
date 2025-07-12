import React from 'react';

const Header = ({ toggleSidebar }) => (
  <header className="bg-light border-bottom d-flex align-items-center justify-content-between px-3 py-2">
    <button
      type="button"
      className="btn btn-primary d-md-none"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      style={{
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 6px rgba(0,0,0,0.2)',
        borderRadius: '6px',
      }}
    >
      {/* Ícono hamburguesa con color blanco */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="white"
        viewBox="0 0 24 24"
      >
        <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
    <h5 className="m-0 fs-5 fw-semibold">Panel de Control</h5>
  </header>
);

export default Header;
