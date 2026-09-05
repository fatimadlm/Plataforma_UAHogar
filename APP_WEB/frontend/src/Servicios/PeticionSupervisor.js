import { apiFetch } from './apiFetch';
import { API_URL } from '../Configuracion/apiConfig';

const BASE_SUPERVISOR = `${API_URL}/api/supervisor`;

// Metricas
export async function getMetricasGlobales() {
  const res = await apiFetch(`${BASE_SUPERVISOR}/metricas`);
  if (!res.ok) throw new Error('No se pudieron cargar las métricas');
  return await res.json();
}

// Obtener usuarios con filtros
export async function getUsuariosSupervision(busqueda = '', estado = '') {
  const params = new URLSearchParams();
  if (busqueda) params.set('busqueda', busqueda);
  if (estado) params.set('estado', estado);

  const res = await apiFetch(`${BASE_SUPERVISOR}/usuarios?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudieron cargar los usuarios');
  return await res.json();
}

// Bloquear o desbloquear usuario
export async function alternarBloqueoUsuario(usuarioId) {
  const res = await apiFetch(`${BASE_SUPERVISOR}/usuarios/${usuarioId}/bloquear`, {
    method: 'PUT'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'No se pudo cambiar el estado del usuario');
  }
  return await res.json();
}

// Cambiar rol de usuario
export async function cambiarRolUsuario(usuarioId, rolGlobal) {
  const res = await apiFetch(`${BASE_SUPERVISOR}/usuarios/${usuarioId}/rol`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rolGlobal })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'No se pudo cambiar el rol del usuario');
  }
  return await res.json();
}

// Eliminar usuario
export async function eliminarUsuarioSupervision(usuarioId) {
  const res = await apiFetch(`${BASE_SUPERVISOR}/usuarios/${usuarioId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'No se pudo eliminar el usuario');
  }
  return await res.text();
}

// Obtener hogares con filtro
export async function getHogaresSupervision(busqueda = '') {
  const params = new URLSearchParams();
  if (busqueda) params.set('busqueda', busqueda);

  const res = await apiFetch(`${BASE_SUPERVISOR}/hogares?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudieron cargar los hogares');
  return await res.json();
}

// Vista del detalle del hogar
export async function getDetalleHogarSupervision(hogarId) {
  const res = await apiFetch(`${BASE_SUPERVISOR}/hogares/${hogarId}`);
  if (!res.ok) throw new Error('No se pudo cargar el detalle del hogar');
  return await res.json();
}

export async function getDetalleAmpliadoHogarSupervision(hogarId) {
  const res = await apiFetch(`${BASE_SUPERVISOR}/hogares/${hogarId}/detalle`);
  if (!res.ok) throw new Error('No se pudo cargar el detalle ampliado del hogar');
  return await res.json();
}

// Eliminar hogar
export async function eliminarHogarSupervision(hogarId) {
  const res = await apiFetch(`${BASE_SUPERVISOR}/hogares/${hogarId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'No se pudo eliminar el hogar');
  }
  return await res.text();
}

// Buscar tareas con filtros
export async function getTareasSupervision(
  busqueda = '',
  estado = '',
  tipo = '',
  usuarioId = '',
  orden = ''
) {
  const params = new URLSearchParams();

  if (busqueda) params.set('busqueda', busqueda);
  if (estado) params.set('estado', estado);
  if (tipo) params.set('tipo', tipo);
  if (usuarioId) params.set('usuarioId', usuarioId);
  if (orden) params.set('orden', orden);

  const query = params.toString();

  const res = await apiFetch(
    `${BASE_SUPERVISOR}/tareas${query ? `?${query}` : ''}`
  );

  if (!res.ok) {
    throw new Error('No se pudieron cargar las tareas');
  }

  return await res.json();
}

// Eliminar tarea
export async function eliminarTareaSupervision(tareaId) {
  const res = await apiFetch(`${BASE_SUPERVISOR}/tareas/${tareaId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'No se pudo eliminar la tarea');
  }
  return await res.text();
}

// Borra de golpe todos los hogares fantasma
export async function limpiarHogaresFantasma() {
  const res = await apiFetch(`${BASE_SUPERVISOR}/hogares/fantasma`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'No se pudieron limpiar los hogares fantasma');
  }
  return await res.text();
}

// Obtener incidencias con texto  y filtro por estado 
export async function getIncidenciasSupervision(busqueda = '', estado = '') {
  const params = new URLSearchParams();
  if (busqueda) params.set('busqueda', busqueda);
  if (estado) params.set('estado', estado);

  const res = await apiFetch(`${BASE_SUPERVISOR}/incidencias?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudieron cargar las incidencias');
  return await res.json();
}

// Cierra una incidencia como supervisor
export async function cerrarIncidenciaSupervision(incidenciaId) {
  const res = await apiFetch(`${BASE_SUPERVISOR}/incidencias/${incidenciaId}/cerrar`, {
    method: 'PUT'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'No se pudo cerrar la incidencia');
  }
  return await res.text();
}

export async function getAuditoriaSupervision(busqueda = '', accion = '') {
  const params = new URLSearchParams();
  if (busqueda) params.set('busqueda', busqueda);
  if (accion) params.set('accion', accion);

  const res = await apiFetch(`${BASE_SUPERVISOR}/auditoria?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar la auditoría');
  return await res.json();
}