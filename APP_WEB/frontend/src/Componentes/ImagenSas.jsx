import { useEffect, useState } from 'react';
import { obtenerUrlImagenSas } from '../Servicios/PeticionTarea';
// Guardamos las URLs durante 25 minutos
const CACHE_DURACION_MS = 25 * 60 * 1000;
const cacheUrls = new Map();

// Cargar una imagen usando una URL SAS 
export default function ImagenSas({
  ruta,
  alt = '',
  className,
  onError,
  onClick,
  fallback = null,
  ...props
}) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let activo = true;
// Si no hay ruta, no mostramos nada
    if (!ruta) {
      setUrl(null);
      return () => { activo = false; };
    }


// Si ya es un enlace completo
    if (ruta.startsWith('http://') || ruta.startsWith('https://') || ruta.startsWith('blob:')) {
      setUrl(ruta);
      return () => { activo = false; };
    }
// Si ya la tenemos guardada en memoria
    const guardada = cacheUrls.get(ruta);
    if (guardada && guardada.expira > Date.now()) {
      setUrl(guardada.url);
      return () => { activo = false; };
    }

    setUrl(null);

    obtenerUrlImagenSas(ruta)
      .then((urlSas) => {
        if (!activo) return;
        // Guardamos en la memoria
        cacheUrls.set(ruta, { url: urlSas, expira: Date.now() + CACHE_DURACION_MS });
        setUrl(urlSas);
      })
      .catch(() => {
        if (!activo) return;
        setUrl(null);
      });

    return () => { activo = false; };
  }, [ruta]);

  const manejarError = (evento) => {
    setUrl(null);
    if (onError) onError(evento);
  };

  if (!url) return fallback;

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={manejarError}
      onClick={onClick}
      {...props}
    />
  );
}
