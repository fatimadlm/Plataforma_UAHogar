import { Navigate } from 'react-router-dom';

export default function RutaProtegida({ children }) {
  // Comprobamos que hay sesión Y token guardados en el navegador
  const usuarioActivo = localStorage.getItem('usuarioActivo');
  const token = localStorage.getItem('token');

  // si no hay nadie logueado, lo mandamos directo al LOGIN
  // con replace evita que pueda volver atrás con la flecha del navegador
  if (!usuarioActivo || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
