/*Interfaces para la administracion de grupos*/
export interface ApiJugador {
    id_jugador: number;
    nombre: string;
    empresa: string;
    nombreAcompanante: string;
    empresaAcompanante: string;
    nivel: number;
  }
  
  export interface ApiPartida {
    id_partida: number;
    id_juego: number;
    id_grupo: number;
    ronda: number; // La ronda ahora viene en cada partida
    equiposX: ApiJugador[];
    equiposY: ApiJugador[];
    resultado: string;
  }
  
 export interface ApiResponse {
    message: string;
    details: {
      juego: string;
      grupo: string;
      total_partidas: number;
      total_rondas: number; // Nuevo campo
    };
    rondas: { // Objeto con rondas
      [key: string]: ApiPartida[];
    };
  }
  
  // INTERFACES INTERNAS DEL COMPONENTE
  export interface Jugador {
    id: string;
    nombre: string;
    nombreAcompanante: string;
    nivel: number;
  }
  
  export interface Partida {
    id: number;
    ronda: number; // Se añade la ronda para filtrar
    jugadores: Jugador[];
  }