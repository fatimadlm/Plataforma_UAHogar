// Añadimos el token del login
export async function apiFetch(url, opciones = {}) {
  const token = localStorage.getItem('token');

  const cabeceras = {
    ...(opciones.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const respuesta = await fetch(url, { ...opciones, headers: cabeceras });

  // Si el token ha caducado o no es valido, mandamos al login
  if (respuesta.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioActivo');
    window.location.href = '/login';
  }

  return respuesta;
}
