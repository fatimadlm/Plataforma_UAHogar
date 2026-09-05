import { Bell,MessageCircle,CheckCircle2,Info,ArrowLeftRight} from 'lucide-react';

export const CONFIGURACION_NOTIFICACIONES = {
  TAREA_ASIGNADA: {
    icono: CheckCircle2,
    color: '#06d6a0'
  },

  TAREA_URGENTE: {
    icono: Bell,
    color: '#e76f51'
  },

  TAREA_MARGEN_GRACIA: {
    icono: Bell,
    color: '#f4a261'
  },

  INCIDENCIA_NUEVA: {
    icono: Info,
    color: '#e76f51'
  },

  INCIDENCIA_CERRADA: {
    icono: Info,
    color: '#e76f51'
  },

  UNION_HOGAR: {
    icono: Info,
    color: '#90b4ce'
  },

  EXPULSADO_HOGAR: {
    icono: Info,
    color: '#e76f51'
  },

  TAREA_COMPLETADA: {
    icono: CheckCircle2,
    color: '#06d6a0'
  },

  MENSAJE_NUEVO: {
    icono: MessageCircle,
    color: '#90b4ce'
  },

  INTERCAMBIO_SOLICITADO: {
    icono: ArrowLeftRight,
    color: '#3d5a80'
  },

  INTERCAMBIO_ACEPTADO: {
    icono: ArrowLeftRight,
    color: '#06d6a0'
  },

  INTERCAMBIO_RECHAZADO: {
    icono: ArrowLeftRight,
    color: '#e76f51'
  },

  INTERCAMBIO_CADUCADO: {
    icono: ArrowLeftRight,
    color: '#90b4ce'
  }
};

export const obtenerConfiguracionNotificacion = (tipo) => {
  return CONFIGURACION_NOTIFICACIONES[tipo] || {
    icono: Info,
    color: '#90b4ce'
  };
};

