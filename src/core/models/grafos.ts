export interface Jugador {
    id_jugador: number;
    nombre: string;
    nivel: number;
  }
  
  export interface Partida {
    id: string;
    id_partida: number;
    ronda: number;
    equiposX: Jugador[];
    equiposY: Jugador[];
    resultado: string;
  }
  
  export interface NodoTorneo {
    id: string;
    ronda: number;
    posicion: number;
    jugador1: Jugador | null;
    jugador2: Jugador | null;
  }