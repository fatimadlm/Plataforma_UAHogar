
import {
  Home, HeartHandshake, Building, Users, Castle,
  Waves, Palmtree, Trees, Sunrise, Mountain
} from 'lucide-react';
 
export const APARIENCIAS_HOGAR = [
  //Casas 
  {
    id: 'azul-noche',
    nombre: 'Azul noche',
    gradiente: 'linear-gradient(135deg, #90b4ce 0%, #3d5a80 100%)',
    Icono: Home,
  },
  {
    id: 'amarillo-sol',
    nombre: 'Amarillo sol',
    gradiente: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    Icono: HeartHandshake,
  },
  {
    id: 'morado-urbano',
    nombre: 'Morado urbano',
    gradiente: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',
    Icono: Building,
  },
  {
    id: 'turquesa-comunidad',
    nombre: 'Turquesa comunidad',
    gradiente: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
    Icono: Users,
  },
  {
    id: 'rojo-castillo',
    nombre: 'Rojo castillo',
    gradiente: 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',
    Icono: Castle,
  },
 
  //Vacaciones
  {
    id: 'azul-piscina',
    nombre: 'Azul piscina',
    gradiente: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    Icono: Waves,
  },
  {
    id: 'naranja-playa',
    nombre: 'Naranja playa',
    gradiente: 'linear-gradient(135deg, #f7971e 0%, #f45c43 100%)',
    Icono: Palmtree,
  },
  {
    id: 'verde-bosque',
    nombre: 'Verde bosque',
    gradiente: 'linear-gradient(135deg, #1d976c 0%, #93f9b9 100%)',
    Icono: Trees,
  },
  {
    id: 'atardecer',
    nombre: 'Atardecer',
    gradiente: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
    Icono: Sunrise,
  },
  {
    id: 'verde-montana',
    nombre: 'Verde montaña',
    gradiente: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    Icono: Mountain,
  },
];
 
/**
 * Devuelve una apariencia por su id
 * Si no se encuentra, devuelve la primera 
 */
export function getApariencia(id) {
  return APARIENCIAS_HOGAR.find((a) => a.id === id) ?? APARIENCIAS_HOGAR[0];
}
 