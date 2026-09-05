import { apiFetch } from './apiFetch';
import { API_URL } from '../Configuracion/apiConfig';

const BASE_URL        = `${API_URL}/api/tareas`;
const BASE_HOGARES    = `${API_URL}/api/hogares`;
const BASE_USUARIOS   = `${API_URL}/api/usuarios`;
const BASE_IMAGENES   = `${API_URL}/api/imagenes`;
const BASE_NOTIF      = `${API_URL}/api/notificaciones`;
const BASE_MIEMBROS   = `${API_URL}/api/miembros`;
const BASE_INCIDENCIAS = `${API_URL}/api/incidencias`;
const BASE_INTERCAMBIOS = `${API_URL}/api/intercambios`;

// TAREAS
//Devuelve el consejo solicitado
export async function consultarTarea(tareaId, regenerar = false) {
  const res = await apiFetch(`${BASE_URL}/consultar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tareaId, regenerar })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'No se pudo generar la ayuda');
  }
  return await res.json();
}
// Devuelve las instancias pendientes y en margen de gracia del usuario
export async function getTareasPorUsuario(usuarioId) {
  const res = await apiFetch(`${BASE_URL}/usuario/${usuarioId}`);
  if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
  const datos = await res.json();
  return Array.isArray(datos) ? datos : [];
}

// Devuelve el historial paginado de tareas completadas en un hogar
export async function getHistorialHogar(hogarId, pagina = 0, limite = 14) {
  const res = await apiFetch(`${BASE_URL}/historial/hogar/${hogarId}?pagina=${pagina}&limite=${limite}`);
  if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
  return await res.json();
}

// Completa una tarea y devuelve los puntos obtenidos y la penalizacion si la hay
export async function completarTarea(tareaId, imagenUrl = null) {
  const res = await apiFetch(`${BASE_URL}/completar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tareaId, imagenUrl })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return await res.json();
}

// Devuelve las instancias activas de un hogar en los proximos 15 dias
export async function getInstanciasActivasHogar(hogarId) {
  const res = await apiFetch(`${BASE_URL}/hogar/${hogarId}/instancias-activas`);
  if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
  const datos = await res.json();
  return Array.isArray(datos) ? datos : [];
}

// Devuelve las plantillas activas de un hogar
export async function getPlantillasHogar(hogarId) {
  const res = await apiFetch(`${BASE_URL}/hogar/${hogarId}`);
  if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
  const datos = await res.json();
  return Array.isArray(datos) ? datos : [];
}

// Estima el tiempo de una tarea y calcula sus puntos en el backend
export async function estimarTiempoTarea(nombre, descripcion, tipo) {
  const res = await apiFetch(`${BASE_URL}/estimar-tiempo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, descripcion, tipo })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'No se pudo estimar el tiempo');
  }

  return await res.json();
}

// Crea una nueva plantilla de tarea en un hogar
export async function crearTarea(hogarId, datos) {
  const res = await apiFetch(`${BASE_URL}/crear?hogarId=${hogarId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al crear la tarea');
  }
  return await res.json();
}

// Elimina una plantilla ahora o al completarse segun la opcion elegida
export async function eliminarPlantilla(tareaId, opcion) {
  const res = await apiFetch(`${BASE_URL}/${tareaId}/eliminar?opcion=${opcion}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al eliminar la plantilla');
  }
  return true;
}

// Devuelve tareas completadas en hogares que dos usuarios comparten
export async function getTareasRecientesComunes(usuarioId, miId) {
  const res = await apiFetch(`${BASE_URL}/recientes-comunes?usuarioId=${usuarioId}&miId=${miId}`);
  if (!res.ok) throw new Error('Error al cargar tareas recientes en común');
  return await res.json();
}

// Estadisticas del usuario para el perfil
export async function getEstadisticasUsuario(usuarioId) {
  const res = await apiFetch(`${BASE_URL}/estadisticas/usuario/${usuarioId}`);
  if (!res.ok) throw new Error(`Error del servidor al pedir estadísticas: ${res.status}`);
  return await res.json();
}

// HOGARES

// Devuelve los hogares a los que pertenece un usuario
export async function getHogaresPorUsuario(usuarioId) {
  const res = await apiFetch(`${BASE_HOGARES}/usuario/${usuarioId}`);
  if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
  const datos = await res.json();
  return Array.isArray(datos) ? datos : [];
}
// Devuelve las estadisticas completas del hogar con ranking mensual
export async function getEstadisticasHogar(hogarId) {
  const res = await apiFetch(`${BASE_HOGARES}/${hogarId}/estadisticas`);
  if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
  return await res.json();
}
 
// Devuelve los miembros y la actividad reciente del panel de un hogar
export async function getPanelHogar(hogarId) {
  const res = await apiFetch(`${BASE_HOGARES}/${hogarId}/panel`);
  if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
  return await res.json();
}

// Permite al usuario  abandonar un hogar
export async function abandonarHogar(hogarId) {
  const res = await apiFetch(`${BASE_HOGARES}/${hogarId}/abandonar`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al abandonar el hogar');
  }
  return await res.text();
}

// Permite a un ADMIN (el usuario logueado) expulsar a un miembro del hogar
export async function expulsarMiembro(hogarId, usuarioId) {
  const res = await apiFetch(`${BASE_HOGARES}/${hogarId}/expulsar?usuarioId=${usuarioId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al expulsar al miembro');
  }
  return await res.text();
}
 
// IMAGENES

// Sube una imagen de tarea y devuelve la ruta publica en el servidor
export async function subirImagenTarea(archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const res = await apiFetch(`${BASE_IMAGENES}/subir/tarea`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'No se pudo subir la imagen');
  }
  return (await res.text()).trim();
}

// Sube la foto de perfil y devuelve la ruta
export async function subirImagenPerfil(archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const res = await apiFetch(`${BASE_IMAGENES}/subir/perfil`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'No se pudo subir la imagen de perfil');
  }
  return (await res.text()).trim();
}

// USUARIOS

// Actualiza los datos del usuario en la base de datos
export async function actualizarPerfilUsuario(usuarioId, datos) {
  const res = await apiFetch(`${BASE_USUARIOS}/${usuarioId}/editar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!res.ok) {
    const errorTexto = await res.text();
    throw new Error(errorTexto || 'Error al actualizar el perfil');
  }
  return await res.json();
}

// Devuelve el perfil de otro usuario con sus estadisticas compartidas
export async function getPerfilAjeno(usuarioId, miId) {
  const res = await apiFetch(`${BASE_USUARIOS}/${usuarioId}/perfil-ajeno?miId=${miId}`);
  if (!res.ok) {
    const mensaje = await res.text();
    const error = new Error(mensaje || 'Error al cargar el perfil');
    error.status = res.status;
    throw error;
  }
  return await res.json();
}

// Elimina la propia cuenta del usuario , pidiendo la contraseña
export async function eliminarMiCuenta(password) {
  const res = await apiFetch(`${BASE_USUARIOS}/cuenta`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const mensaje = await res.text();
  if (!res.ok) {
    throw new Error(mensaje || 'No se pudo eliminar la cuenta');
  }
  return mensaje;
}

// MIEMBROS

// Devuelve los compañeros de hogar del usuario
export async function getCompis(usuarioId) {
  const res = await apiFetch(`${BASE_MIEMBROS}/compis/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar tus compis');
  return await res.json();
}

// NOTIFICACIONES
export async function getNotificaciones(usuarioId) {
  const res = await apiFetch(`${BASE_NOTIF}/usuario/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar notificaciones');
  return await res.json();
}

export async function getContadorNoLeidas(usuarioId) {
  const res = await apiFetch(`${BASE_NOTIF}/usuario/${usuarioId}/no-leidas/count`);
  if (!res.ok) return { count: 0 };
  return await res.json();
}

export async function marcarNotificacionLeida(notifId) {
  await apiFetch(`${BASE_NOTIF}/${notifId}/leer`, { method: 'PUT' });
}

export async function marcarTodasLeidas(usuarioId) {
  await apiFetch(`${BASE_NOTIF}/usuario/${usuarioId}/leer-todas`, { method: 'PUT' });
}

export async function borrarNotificacion(notifId) {
  await apiFetch(`${BASE_NOTIF}/${notifId}`, { method: 'DELETE' });
}

export async function borrarTodasNotificaciones(usuarioId) {
 
  await apiFetch(`${BASE_NOTIF}/usuario/${usuarioId}`, { method: 'DELETE' });
}

// INCIDENCIAS

// Reporta un problema con una tarea completada del feed
export async function reportarIncidencia(registroTareaId, descripcion) {
  const res = await apiFetch(`${BASE_INCIDENCIAS}/reportar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registroTareaId, descripcion })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al reportar la incidencia');
  }
  return await res.json();
}

// Detalle de una incidencia para la pantalla a la que lleva la notificación
export async function getIncidencia(incidenciaId) {
  const res = await apiFetch(`${BASE_INCIDENCIAS}/${incidenciaId}`);
  if (!res.ok) throw new Error('Error al cargar la incidencia');
  return await res.json();
}

// Incidencias de un hogar para el panel del administrador
export async function getIncidenciasHogar(hogarId) {
  const res = await apiFetch(`${BASE_INCIDENCIAS}/hogar/${hogarId}`);
  if (!res.ok) throw new Error('Error al cargar las incidencias');
  return await res.json();
}

// Incidencias que ha reportado un usuario
export async function getIncidenciasReportante(usuarioId) {
  const res = await apiFetch(`${BASE_INCIDENCIAS}/reportante/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar tus incidencias');
  return await res.json();
}

// Incidencias sobre tareas que ha hecho un usuario
export async function getIncidenciasResponsable(usuarioId) {
  const res = await apiFetch(`${BASE_INCIDENCIAS}/responsable/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar tus incidencias');
  return await res.json();
}

// Solo un ADMIN puede cerrar una incidencia
export async function cerrarIncidencia(incidenciaId) {
  const res = await apiFetch(`${BASE_INCIDENCIAS}/${incidenciaId}/cerrar`, {
    method: 'PUT'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al cerrar la incidencia');
  }
  return await res.json();
}

// INTERCAMBIOS

// Solicita intercambiar una tarea propia con otro miembro del hogar
export async function solicitarIntercambio(registroTareaId, destinatarioId) {
  const res = await apiFetch(`${BASE_INTERCAMBIOS}/solicitar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registroTareaId, destinatarioId })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al solicitar el intercambio');
  }
  return await res.json();
}

// Detalle de una solicitud de intercambio para  la notificación
export async function getIntercambio(intercambioId) {
  const res = await apiFetch(`${BASE_INTERCAMBIOS}/${intercambioId}`);
  if (!res.ok) throw new Error('Error al cargar la solicitud de intercambio');
  return await res.json();
}

// Solo el destinatario puede aceptar
export async function aceptarIntercambio(intercambioId) {
  const res = await apiFetch(`${BASE_INTERCAMBIOS}/${intercambioId}/aceptar`, {
    method: 'PUT'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al aceptar el intercambio');
  }
  return await res.json();
}

// Solo el destinatario puede rechazar
export async function rechazarIntercambio(intercambioId) {
  const res = await apiFetch(`${BASE_INTERCAMBIOS}/${intercambioId}/rechazar`, {
    method: 'PUT'
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al rechazar el intercambio');
  }
  return await res.json();
}

// Solicitudes pendientes que ha recibido el usuario logueado
export async function getIntercambiosRecibidos(usuarioId) {
  const res = await apiFetch(`${BASE_INTERCAMBIOS}/recibidas/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar las solicitudes recibidas');
  return await res.json();
}

// Solicitudes que ha enviado el usuario logueado (para ver si siguen pendientes)
export async function getIntercambiosEnviados(usuarioId) {
  const res = await apiFetch(`${BASE_INTERCAMBIOS}/enviadas/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar tus solicitudes enviadas');
  return await res.json();
}

// MENSAJES

// Obtiene los mensajes de un chat de grupo
export async function getMensajesGrupo(hogarId) {
  const res = await apiFetch(`${BASE_URL.replace('/tareas', '')}/mensajes/grupo/${hogarId}`);
  if (!res.ok) throw new Error(`Error al cargar mensajes del grupo: ${res.status}`);
  const datos = await res.json();
  return Array.isArray(datos) ? datos : [];
}

// Envía un mensaje a un chat de grupo
export async function enviarMensajeGrupo(hogarId, remitenteId, contenido) {
  const res = await apiFetch(`${BASE_URL.replace('/tareas', '')}/mensajes/grupo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hogarId, remitenteId, contenido })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al enviar mensaje');
  }
  return await res.json();
}

// Obtiene los mensajes privados entre dos usuarios
export async function getMensajesPrivados(usuarioId, otroId) {
  const res = await apiFetch(`${BASE_URL.replace('/tareas', '')}/mensajes/privado?usuarioId=${usuarioId}&otroId=${otroId}`);
  if (!res.ok) throw new Error(`Error al cargar mensajes privados: ${res.status}`);
  const datos = await res.json();
  return Array.isArray(datos) ? datos : [];
}

// Envía un mensaje privado a otro usuario
export async function enviarMensajePrivado(remitenteId, receptorId, contenido) {
  const res = await apiFetch(`${BASE_URL.replace('/tareas', '')}/mensajes/privado`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remitenteId, receptorId, contenido })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Error al enviar mensaje privado');
  }
  return await res.json();
}