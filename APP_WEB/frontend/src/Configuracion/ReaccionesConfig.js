import { ThumbsUp, Heart, Laugh, Frown, Flame } from 'lucide-react';

export const REACCIONES = [
  { id: 'LIKE', Componente: ThumbsUp, color: '#3b82f6' },
  { id: 'AMOR', Componente: Heart, color: '#ef4444'},
  { id: 'RISA', Componente: Laugh, color: '#eab308' },
  { id: 'TRISTE', Componente: Frown, color: '#64748b'},
  { id: 'FUEGO', Componente: Flame, color: '#f97316'}
];

// Busca los datos de una reaccion por su id
export function obtenerReaccion(id) {
  return REACCIONES.find(r => r.id === id);
}