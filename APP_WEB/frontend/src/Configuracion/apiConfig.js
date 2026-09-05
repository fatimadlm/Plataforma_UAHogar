// URL base del backend (por defecto localhost:8080)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Imagen por defecto si falla la carga
export const IMAGEN_ERROR = `${API_URL}/recursos/Error.svg`;

// Obtiene la URL  de una imagen
export const getImageUrl = (path) => {
  if (!path) return IMAGEN_ERROR;
  return path.startsWith('http') ? path : `${API_URL}${path}`;
};

// Sustituye la imagen que falla por la imagen de error
export const manejarErrorImagen = (evento) => {
  evento.target.onerror = null;
  evento.target.src = IMAGEN_ERROR;
};