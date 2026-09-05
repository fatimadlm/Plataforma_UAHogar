import { Trophy, Medal } from 'lucide-react';

// Tipos de tarea disponibles en el sistema
export const TIPOS = ['LIMPIEZA', 'COMPRAS', 'MANTENIMIENTO', 'MASCOTAS', 'COCINA', 'OTRO'];

// Frecuencias disponibles para las plantillas
export const FRECUENCIAS = ['OCASIONAL', 'DIARIA', 'SEMANAL', 'MENSUAL'];

// Estados posibles de una tarea
export const ESTADOS_TAREA = ['PENDIENTE', 'VENCIDA', 'COMPLETADA'];

// meses
export const NOMBRES_MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Nombres completos de los meses para el ranking mensual
export const NOMBRES_MESES_COMPLETOS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Dias de la semana en corto empezando por lunes
export const DIAS_SEMANA_CORTO = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Devuelve el nombre corto del dia de la semana de una fecha
export const nombreDiaSemana = (fecha) => {
  const idx = fecha.getDay();
  return DIAS_SEMANA_CORTO[idx === 0 ? 6 : idx - 1];
};

// Genera un array con los 15 dias desde hoy para los calendarios
export const generarDias15 = () => {
  const dias = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  for (let i = 0; i < 15; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    dias.push(d);
  }
  return dias;
};

// Configuracion visual del podium para el ranking mensual
export const podiumConfig = [
  { color: '#FFD700', label: '1', icono: Trophy },
  { color: '#C0C0C0', label: '2', icono: Medal },
  { color: '#CD7F32', label: '3', icono: Medal },
];

// Devuelve el color asociado al tipo de tarea
export const colorTipo = (tipo) => {
  switch ((tipo || '').toUpperCase()) {
    case 'LIMPIEZA':      return '#4a6b8a';
    case 'COMPRAS':       return '#a85a1a';
    case 'MANTENIMIENTO': return '#18665e';
    case 'MASCOTAS':      return '#b04a29';
    case 'COCINA':        return '#8338ec';
    default:              return '#5c6b7a';
  }
};