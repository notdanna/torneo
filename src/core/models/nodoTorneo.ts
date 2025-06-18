export interface Jugador {
  id: string;
  nombre: string;
  nivel: number;
}

export interface NodoTorneo {
  id: string;
  jugador1: Jugador | null;
  jugador2: Jugador | null;
  ganador: Jugador | null;
  ronda: number;
  posicion: number;
}