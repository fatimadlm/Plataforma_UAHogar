import { createContext, useState, useContext } from 'react';

const ContextoSesion = createContext();

// Proveedor que envuelve la app y reparte los datos del usuario
export const ProveedorSesion = ({ children }) => {
    
    // Recupera el usuario guardado en el navegador
    const [usuario, setUsuario] = useState(() => {
        const usuarioGuardado = localStorage.getItem('usuarioActivo');
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;//Sino nulo
    });

    // Guarda el usuario y el token 
    const iniciarSesion = (datosUsuario, token) => {
        const usuarioSeguro = Object.fromEntries(
            Object.entries(datosUsuario).filter(([clave]) => clave !== 'password')
        );
        setUsuario(usuarioSeguro);
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioSeguro));
        if (token) {
            localStorage.setItem('token', token);
        }
    };

    // Borra el usuario y el token de la memoria y del navegador al salir
    const cerrarSesion = () => {
        setUsuario(null);
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('token');
    };

    return (
        <ContextoSesion.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
            {children}
        </ContextoSesion.Provider>
    );
};

// Atajo 
// eslint-disable-next-line react-refresh/only-export-components
export const useSesion = () => useContext(ContextoSesion);
