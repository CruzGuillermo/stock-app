import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    // Leer desde localStorage al iniciar
    const usuarioGuardado = localStorage.getItem('usuario');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  // Guardar en localStorage cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('usuario');
    }
  }, [usuario]);

  return (
    <UserContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
