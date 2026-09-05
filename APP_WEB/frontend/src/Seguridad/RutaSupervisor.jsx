import { Navigate } from 'react-router-dom';

  // Comprobamos que hay sesión , role de supervisor y  token guardados en el navegador
export default function RutaSupervisor({ children }) {
  const usuarioGuardado = localStorage.getItem('usuarioActivo');
  const token = localStorage.getItem('token');

  // si no hay nadie logueado, va al login 
  if (!usuarioGuardado || !token) {
    return <Navigate to="/login" replace />;
  }

  const usuario = JSON.parse(usuarioGuardado);

  // si esta logueado pero no es supervisor, lo mandamos al feed
  if (usuario.rolGlobal !== 'SUPERVISOR') {
    return <Navigate to="/feed" replace />;
  }

  return children;
}
