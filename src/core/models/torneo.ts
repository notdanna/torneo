export interface Torneo {
    id_torneo: number;
    id_juego: number;
}

// Modelo actualizado para soportar parejas
// Cuando esten activos ya no pueden jugar, la busqueda se hace por activo: false
export interface Jugador {
    id_jugador: string; // ✅ ID del documento de Firebase (siempre string)
    nombre: string;
    nombreAcompanante?: string;
    empresa: string;
    empresaAcompanante?: string;
    nivel: number;
    activo: boolean;
    fechaCreacion?: string;
    fechaActualizacion?: string;
  }
export interface Grupo {
    id_grupo: number;
    id_juego: number;
    participantes: string[];
    num_grupo: number;
    id_ruelas?: string;
    id_futbolito?: string;
    id_futbolitos_soplados?: string;
    id_beer_pong?: string;
}

export interface Partida {
    id_partida: number;
    id_juego: number;
    id_grupo: number;
    // Conjunto de equipos en parejas o individuales en vs
    equiposA: string[];
    equiposB: string[];
    resultado: string;
}

export interface Juegos {
    id_juego: number;
    nombre_juego: string;
    premio: string;
    jugadores: Jugador[];
    num_jugadores: number;
}

// JUEGOS
export interface Ruelas {
    id: string;
    parejas: string[];
}

export interface Futbolito {
    id: string;
    parejas: string[];
}

export interface FutbolitoSoplado {
    id: string;
    parejas: string[];
}

export interface BeerPong {
    id: string;    
    parejas: string[];
}
/*=========================Models para jugador a grupo=========================*/
export interface JugadorJuegoData {
    id_jugador: number;
    id_juego: number;
  }
  
  export interface JugadorJuegoRequest {
    jugador_juego: JugadorJuegoData;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  /*=========================Models para jugador a grupo=========================*/
  export interface AgregarGrupoRequest {
    jugadorId: number;
    grupoId: number;
    juegoId: number;
  }
  
  export interface AgregarGrupoResponse {
    // Define aquí la estructura de respuesta según lo que devuelva tu API
    success?: boolean;
    message?: string;
    data?: any;
  }
  export const extraerIdJugador = (jugador: any): string | null => {
    const posiblesIds = [
      jugador.id_jugador,
      jugador.id,
      jugador._id,
      jugador.jugadorId,
      jugador.playerId
    ];
    
    for (const id of posiblesIds) {
      if (id !== undefined && id !== null && id !== '') {
        return id.toString();
      }
    }
    
    return null;
  };