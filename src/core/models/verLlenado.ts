
// Interfaces para tipar los datos
export interface Grupo {
  id: string;
  nombre: string;
  jugadores: number;
  capacidadMaxima: number;
  activo: boolean;
  datos?: any; // Para guardar datos adicionales del grupo
}

export interface Juego {
  id: number;
  nombre: string;
  icono: string;
  descripcion: string;
  grupos: Grupo[];
  totalJugadores: number;
  capacidadTotal: number;
  estado: 'sin_datos' | 'con_datos' | 'completo';
}
